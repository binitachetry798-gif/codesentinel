const Groq = require("groq-sdk");
const secureJsonParse = require("secure-json-parse");
const { RateLimiterMemory } = require("rate-limiter-flexible");

// Mock secure storage with key validation
const secureKeyStore = {
  get: async (key) => {
    const allowedKeys = ["GROQ_API_KEY"];
    if (allowedKeys.includes(key)) {
      return process.env[key];
    } else {
      throw new Error(`Access denied for key: ${key}`);
    }
  },
};

// Enterprise-grade rate limiter for external APIs
const rateLimiter = new RateLimiterMemory({
  points: 30, // 30 requests
  duration: 60, // Per 60 seconds
});

const SYSTEM_PROMPT = `You are a senior application security engineer. You specialize in finding security vulnerabilities in source code. You always respond with valid JSON only. You never include markdown code fences, preamble, or any text outside the JSON object.`;

/**
 * Analyzes a source code file for security vulnerabilities using Groq AI.
 * @param {string} filePath - Path of the file
 * @param {string} fileContent - Raw source code
 * @param {string} extension - File extension without dot (e.g. "js")
 * @returns {Promise<Object>} Analysis result object
 */
async function analyzeFile(filePath, fileContent, extension) {
  const apiKey = await secureKeyStore.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const client = new Groq({ apiKey });
  
  try {
    await rateLimiter.consume("groq_api", 1);
  } catch (rejRes) {
    // wait for token
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();
    const waitTime = Math.min(rejRes.msBeforeNext || 1000, timeout);
    while (Date.now() - startTime < waitTime) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const userPrompt = `Analyze this ${extension} file for security vulnerabilities.
File path: ${filePath}

Source code:
${fileContent}

Find ALL security vulnerabilities present. For each one found respond with this exact JSON structure:
{
  "file": "filepath string",
  "vulnerabilities": [
    {
      "id": "unique string like vuln_1 vuln_2 etc",
      "type": "vulnerability name like SQL Injection or XSS",
      "line": 0,
      "severity": "one of Critical High Medium Low",
      "explanation": "plain English explanation in 2-3 sentences written for a developer with no security background",
      "vulnerable_code": "the dangerous code snippet",
      "fixed_code": "the corrected replacement code",
      "owasp": "the OWASP category like A03:2021 Injection"
    }
  ],
  "file_summary": "one sentence about the security health of this file",
  "risk_score": 0
}

If no vulnerabilities exist return vulnerabilities as empty array and risk_score as 0.`;

  try {
    console.log(`[AIAnalyzer] Sending ${filePath} to Groq (${extension} file)...`);

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    let rawText = response.choices[0].message.content;

    // Clean any accidental markdown fences
    rawText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    // Secure parsing utilizing strict JSON library
    let parsed;
    try {
      parsed = secureJsonParse.parse(rawText);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid response format: not an object");
      }
    } catch (e) {
      console.warn(`[AIAnalyzer] Parsing error for ${filePath}: ${e.message}`);
      // Return structured failure rather than weak regex fallback
      return {
        file: filePath,
        vulnerabilities: [],
        file_summary: "Analysis failed due to response parsing error.",
        risk_score: 0,
      };
    }

    console.log(
      `[AIAnalyzer] ${filePath} → ${parsed.vulnerabilities?.length || 0} vulnerabilities, risk score: ${parsed.risk_score}`
    );
    return parsed;
  } catch (err) {
    console.error(`[AIAnalyzer] Error analyzing ${filePath}: ${err.message}`);
    return {
      file: filePath,
      vulnerabilities: [],
      file_summary: "Analysis failed due to an error.",
      risk_score: 0,
    };
  }
}

module.exports = { analyzeFile };
