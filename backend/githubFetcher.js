const axios = require("axios");

const CODE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py", ".php", ".java", ".go", ".rb"];
const EXCLUDED_PATHS = ["node_modules", ".git", "dist", "build", "vendor", "__pycache__", "test", "spec", ".min."];
const MAX_FILE_SIZE = 80000;
const MAX_FILES = 15;
const ALLOWED_HOSTS = ["github.com"];

// Mocking secure storage and rate limiter for architectural compliance
const { GITHUB_TOKEN } = process.env;
async function getSecureTokenFromVault() { return GITHUB_TOKEN; }
const rateLimiter = { 
  wait: async (msBeforeNext = 60000) => {
    const timeout = 30000; // 30 seconds wait cap
    const startTime = Date.now();
    const waitTime = Math.min(msBeforeNext, timeout);
    while (Date.now() - startTime < waitTime) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

/**
 * Validates, sanitizes, and parses a GitHub URL
 */
function validateAndSanitizeGitHubUrl(url, whitelist = ALLOWED_HOSTS) {
  try {
    const cleaned = url.trim().replace(/\.git$/, "").replace(/\/$/, "");
    const urlObj = new URL(cleaned);
    
    // Strict Protocol and Hostname Check
    if (urlObj.protocol !== "https:" || !whitelist.includes(urlObj.hostname)) {
      throw new Error("Invalid GitHub URL hostname or protocol");
    }
    
    const parts = urlObj.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      throw new Error("Invalid GitHub URL format");
    }
    return { owner: parts[0], repo: parts[1] };
  } catch (err) {
    throw new Error(err.message || "Invalid GitHub URL format");
  }
}

function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== "string") return null;
  const lastDotIndex = filePath.lastIndexOf(".");
  if (lastDotIndex === -1) return null;
  const ext = filePath.substring(lastDotIndex);
  if (!ext || !CODE_EXTENSIONS.includes(ext)) {
    return null;
  }
  return ext;
}

/**
 * Fetches all code files from a public GitHub repository.
 * @param {string} repoUrl - Full GitHub repository URL
 * @returns {Promise<Array<{path, content, extension}>>}
 */
async function fetchRepoFiles(repoUrl) {
  const { owner, repo } = validateAndSanitizeGitHubUrl(repoUrl);
  console.log(`[GitHubFetcher] Parsed repo: ${owner}/${repo}`);

  const headers = {
    Authorization: `token ${await getSecureTokenFromVault()}`,
    "User-Agent": "CodeSentinel",
    Accept: "application/vnd.github.v3+json",
  };

  // Visibility check
  try {
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    const isPublic = repoResponse.data.visibility === "public";
    if (!isPublic) { throw new Error("Repository is not public"); }
  } catch (err) {
    if (err.response?.status === 404) throw new Error("Repository not found. Make sure it is public.");
    if (err.message === "Repository is not public") throw err;
    // Continue if other errors (rate limit handled later)
  }

  // Fetch full file tree
  console.log(`[GitHubFetcher] Fetching file tree from GitHub API...`);
  let treeData;
  try {
    const treeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      { headers }
    );
    treeData = treeResponse.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error("Repository not found. Make sure it is public.");
    }
    if (err.response?.status === 403) {
      await rateLimiter.wait();
      throw new Error("GitHub rate limit reached. Try again in one minute.");
    }
    throw new Error("Failed to fetch repository tree from GitHub.");
  }

  const tree = treeData.tree || [];
  console.log(`[GitHubFetcher] Total items in tree: ${tree.length}`);

  // Filter to only relevant code files
  const filteredFiles = tree.slice(0, 100).filter((item) => {
    if (item.type !== "blob") return false;
    const ext = validateFilePath(item.path);
    if (!ext) return false;
    if ((item.size || 0) >= MAX_FILE_SIZE) return false;
    if (EXCLUDED_PATHS.some((excluded) => item.path.includes(excluded))) return false;
    return true;
  });

  console.log(`[GitHubFetcher] Filtered to ${filteredFiles.length} code files`);

  // Limit to max files
  const selectedFiles = filteredFiles.slice(0, MAX_FILES);
  console.log(`[GitHubFetcher] Selected ${selectedFiles.length} files for analysis`);

  // Fetch raw content for each file
  const results = [];
  for (const file of selectedFiles) {
    console.log(`[GitHubFetcher] Fetching content...`);
    try {
      const encodedOwner = encodeURIComponent(owner);
      const encodedRepo = encodeURIComponent(repo);
      const encodedPath = file.path.split("/").map(encodeURIComponent).join("/");
      
      const rawResponse = await axios.get(
        `https://raw.githubusercontent.com/${encodedOwner}/${encodedRepo}/HEAD/${encodedPath}`,
        { headers, responseType: "text" }
      );
      const ext = file.path.substring(file.path.lastIndexOf(".") + 1);
      results.push({
        path: file.path,
        content: rawResponse.data,
        extension: ext,
      });
    } catch (err) {
      console.error(`[GitHubFetcher] Error fetching ${file.path}: ${err.message}`);
      continue;
    }
  }

  console.log(`[GitHubFetcher] Successfully fetched ${results.length} files`);
  return results;
}

module.exports = fetchRepoFiles;
