import { useState } from "react";
import { Search, Play, Loader2 } from "lucide-react";

const EXAMPLE_REPOS = [
  { label: "DVWA", url: "https://github.com/digininja/DVWA" },
  { label: "NodeGoat", url: "https://github.com/OWASP/NodeGoat" },
  { label: "WebGoat", url: "https://github.com/WebGoat/WebGoat" },
];

export default function ScanInput({ onScan, isLoading, error: externalError }) {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState("");

  const validate = (value) => {
    if (!value.trim()) return "Please enter a GitHub repository URL.";
    if (!value.startsWith("https://github.com/")) return "URL must start with https://github.com/";
    return "";
  };

  const handleScan = () => {
    const err = validate(url);
    if (err) { setLocalError(err); return; }
    setLocalError("");
    onScan(url.trim());
  };

  const fillUrl = (repoUrl) => {
    setUrl(repoUrl);
    setLocalError("");
  };

  const handleLiveDemo = () => {
    const demoUrl = "https://github.com/OWASP/NodeGoat";
    setUrl(demoUrl);
    setLocalError("");
    onScan(demoUrl);
  };

  const displayError = localError || externalError;

  return (
    <section
      style={{
        padding: "60px 24px 100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        background: "var(--bg-primary)",
      }}
    >
      {/* Live Demo Button */}
      <button
        className="btn-ghost"
        onClick={handleLiveDemo}
        disabled={isLoading}
        style={{ padding: "10px 24px", fontSize: "0.9rem", marginBottom: 8 }}
      >
        <Play size={15} />
        ▶ Live Demo — Scan NodeGoat
      </button>

      {/* Main Card */}
      <div
        className="glass-card glow-cyan"
        style={{ width: "100%", maxWidth: 680, padding: "36px 32px" }}
      >
        <label
          htmlFor="repo-url-input"
          style={{
            display: "block",
            marginBottom: 10,
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Enter a GitHub Repository URL
        </label>

        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <input
            id="repo-url-input"
            className="cs-input"
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setLocalError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="https://github.com/username/repository"
            disabled={isLoading}
            style={{ padding: "12px 16px", fontSize: "0.9rem" }}
          />
          <button
            className="btn-primary"
            onClick={handleScan}
            disabled={isLoading}
            style={{ padding: "12px 24px", fontSize: "0.9rem", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Scanning...
              </>
            ) : (
              <>
                <Search size={16} />
                Scan Repository
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {displayError && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "rgba(255,45,85,0.1)",
              border: "1px solid rgba(255,45,85,0.3)",
              borderRadius: 8,
              color: "var(--danger-red)",
              fontSize: "0.85rem",
            }}
          >
            ⚠ {displayError}
          </div>
        )}

        {/* Example repos */}
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 10 }}>
            Try an example:
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EXAMPLE_REPOS.map((repo) => (
              <button
                key={repo.label}
                onClick={() => fillUrl(repo.url)}
                disabled={isLoading}
                style={{
                  padding: "6px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "var(--accent-cyan)";
                  e.target.style.color = "var(--accent-cyan)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.color = "var(--text-secondary)";
                }}
              >
                {repo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info row */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {["Public repos only", "Up to 15 files analyzed", "~60-90 seconds"].map((txt) => (
            <span
              key={txt}
              style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}
            >
              <span style={{ color: "var(--accent-green)" }}>✓</span> {txt}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
