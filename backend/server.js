require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jsonschema = require("jsonschema");
const path = require("path");
const fetchRepoFiles = require("./githubFetcher");
const { analyzeFile } = require("./aiAnalyzer");

const app = express();

const schema = {
  type: "object",
  properties: {
    repoUrl: { type: "string" },
  },
  required: ["repoUrl"],
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

app.use(helmet());
app.use(apiLimiter);

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    /\.vercel\.app$/,           // all vercel preview + production URLs
    /\.onrender\.com$/,         // render preview URLs
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb", strict: true }));

// ─── Body Validation Middleware ──────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/api/scan") {
    // Deep clone to ensure schema validation is performed on a clean object
    const bodyClone = JSON.parse(JSON.stringify(req.body));
    const result = jsonschema.validate(bodyClone, schema);
    if (!result.valid) {
      return res.status(400).json({ success: false, error: "Invalid JSON data" });
    }
  }
  next();
});

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

  // Handle potential encoded URL component from client
  try {
    if (repoUrl.includes("%")) {
      repoUrl = decodeURIComponent(repoUrl);
    }
  } catch (e) {
    // Continue if decoding fails
  }

  // Validate and sanitize
  if (!repoUrl || typeof repoUrl !== "string") {
    return res.status(400).json({ success: false, error: "Please provide a valid GitHub repository URL" });
  }
  
  repoUrl = repoUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");

  // Strict URL Validation
  try {
    const urlObj = new URL(repoUrl);
    if (urlObj.protocol !== "https:" || urlObj.hostname !== "github.com") {
      throw new Error("Invalid protocol or hostname");
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
    const normalizedPath = path.normalize(file.path);
    console.log(`[CodeSentinel] Analyzing file ${i + 1}/${files.length}: ${normalizedPath}`);
    try {
      const result = await analyzeFile(normalizedPath, file.content, file.extension);
      fileResults.push(result);
    } catch (err) {
      console.error(`[CodeSentinel] Analysis error for ${normalizedPath}: ${err.message}`);
      fileResults.push({
        file: normalizedPath,
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
  console.error("[CodeSentinel] Unhandled error:", {
    method: req.method,
    url: req.url,
    user_agent: req.headers["user-agent"],
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CodeSentinel backend running on port ${PORT}`);
});
