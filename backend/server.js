require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fetchRepoFiles = require("./githubFetcher");
const { analyzeFile } = require("./aiAnalyzer");

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(helmet());
app.use(apiLimiter);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    /\.vercel\.app$/,           // all vercel preview + production URLs
    /\.onrender\.com$/,         // render preview URLs
  ],
  credentials: true,
}));
app.use(express.json({ limit: '1mb', strict: true })); // added validation and sanitization limit

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CodeSentinel",
    timestamp: new Date().toISOString(),
  });
});

// ─── Main Scan Route ─────────────────────────────────────────────────────────
app.post("/api/scan", async (req, res) => {
  let { repoUrl } = req.body;

  // Validate and sanitize
  if (!repoUrl || typeof repoUrl !== "string") {
    return res.status(400).json({ success: false, error: "Please provide a valid GitHub repository URL" });
  }
  
  repoUrl = repoUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");

  // Strict URL Validation
  try {
    const urlObj = new URL(repoUrl);
    if (urlObj.protocol !== 'https:' || urlObj.hostname !== 'github.com') {
      throw new Error('Invalid protocol or hostname');
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid GitHub repository URL",
    });
  }

  const startTime = Date.now();
  console.log(`\n[CodeSentinel] Starting scan for: ${repoUrl}`);

  // Fetch repo files
  let files;
  try {
    files = await fetchRepoFiles(repoUrl);
    console.log(`[CodeSentinel] Fetched ${files.length} files from repository`);
  } catch (err) {
    console.error(`[CodeSentinel] Fetch error: ${err.message}`);
    const statusCode = err.message.includes("rate limit") ? 403 : 400;
    return res.status(statusCode).json({ success: false, error: err.message });
  }

  // Analyze each file sequentially
  const fileResults = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[CodeSentinel] Analyzing file ${i + 1}/${files.length}: ${file.path}`);
    try {
      const result = await analyzeFile(file.path, file.content, file.extension);
      fileResults.push(result);
    } catch (err) {
      console.error(`[CodeSentinel] Analysis error for ${file.path}: ${err.message}`);
      fileResults.push({
        file: file.path,
        vulnerabilities: [],
        file_summary: "Analysis failed for this file.",
        risk_score: 0,
      });
    }
  }

  // Build flat vulnerability list
  const allVulnerabilities = fileResults.flatMap((result) =>
    result.vulnerabilities.map((v) => ({ ...v, file: result.file }))
  );

  // Calculate stats
  const total_vulnerabilities = allVulnerabilities.length;
  const critical_count = allVulnerabilities.filter((v) => v.severity === "Critical").length;
  const high_count = allVulnerabilities.filter((v) => v.severity === "High").length;
  const medium_count = allVulnerabilities.filter((v) => v.severity === "Medium").length;
  const low_count = allVulnerabilities.filter((v) => v.severity === "Low").length;
  // Weighted risk score based on severity (AI per-file scores are unreliable/low-range)
  // Critical=10, High=5, Medium=2, Low=1 — capped at 100
  const weightedScore = critical_count * 10 + high_count * 5 + medium_count * 2 + low_count * 1;
  const overall_risk_score = Math.min(100, weightedScore);
  const files_scanned = fileResults.length;
  const scan_time_seconds = Math.round((Date.now() - startTime) / 1000);

  console.log(
    `[CodeSentinel] Scan complete! ${total_vulnerabilities} vulnerabilities found in ${scan_time_seconds}s`
  );

  return res.status(200).json({
    success: true,
    repo_url: repoUrl,
    stats: {
      total_vulnerabilities,
      critical_count,
      high_count,
      medium_count,
      low_count,
      overall_risk_score,
      files_scanned,
      scan_time_seconds,
    },
    files: fileResults,
    all_vulnerabilities: allVulnerabilities,
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[CodeSentinel] Unhandled error:", { method: req.method, url: req.url, error: err, stack: err.stack });
  res.status(500).json({ success: false, error: "Internal server error", details: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CodeSentinel backend running on port ${PORT}`);
});
