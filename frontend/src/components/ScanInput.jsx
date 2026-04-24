import { useState, useRef } from "react";
import { Search, Play, Loader2, Link2, ChevronRight, Shield, Zap } from "lucide-react";

const EXAMPLE_REPOS = [
  {
    label: "DVWA",
    url: "https://github.com/digininja/DVWA",
    desc: "Damn Vulnerable Web App",
    badge: "PHP",
    color: "#a855f7",
  },
  {
    label: "NodeGoat",
    url: "https://github.com/OWASP/NodeGoat",
    desc: "OWASP Node.js playground",
    badge: "JS",
    color: "#00d4ff",
  },
  {
    label: "WebGoat",
    url: "https://github.com/WebGoat/WebGoat",
    desc: "Deliberately insecure app",
    badge: "Java",
    color: "#ff8c00",
  },
];

const FEATURES = [
  { icon: <Shield size={13} />, text: "OWASP Top 10 mapped" },
  { icon: <Zap size={13} />, text: "Plain English explanations" },
  { icon: <Search size={13} />, text: "Exact code fixes included" },
];

export default function ScanInput({ onScan, isLoading, error: externalError }) {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Strict GitHub repository URL validation
  const validateGitHubRepositoryURL = (v) => {
    if (!v || !v.trim()) return "Please enter a GitHub repository URL.";
    const targetUrl = v.trim();
    if (!targetUrl.startsWith("https://github.com/")) return "URL must start with https://github.com/";
    try {
      const parts = new URL(targetUrl).pathname.split("/").filter(Boolean);
      if (parts.length < 2) return "Please include both owner and repository name.";
    } catch (e) {
      return "Invalid URL format.";
    }
    return "";
  };

  // Client side throttling state
  const lastRequestTime = useRef(0);
  const rateLimitAllowRequest = () => {
    const now = Date.now();
    if (now - lastRequestTime.current < 5000) return false; // 5 seconds throttle
    lastRequestTime.current = now;
    return true;
  };

  const handleScan = (scanUrl) => {
    const target = scanUrl || url;
    const err = validateGitHubRepositoryURL(target);
    if (err) { setLocalError(err); return; }
    
    if (rateLimitAllowRequest()) {
      setLocalError("");
      onScan(target.trim());
    } else {
      setLocalError("Please wait a few seconds before scanning again.");
    }
  };

  const fillUrl = (repoUrl) => {
    if (validateGitHubRepositoryURL(repoUrl) === "") {
      setUrl(repoUrl);
      setLocalError("");
      inputRef.current?.focus();
    }
  };

  const displayError = localError || externalError;

  return (
    <section style={{
      padding: "0 24px 100px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      background: "var(--bg-0)",
      position: "relative",
    }}>
      {/* Section label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
        animation: "fadeUp 0.5s ease both",
      }}>
        <div style={{ width: 32, height: 1, background: "var(--border-bright)" }} />
        <span style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "JetBrains Mono" }}>
          Scan any public repository
        </span>
        <div style={{ width: 32, height: 1, background: "var(--border-bright)" }} />
      </div>

      {/* Main scan card */}
      <div style={{
        width: "100%",
        maxWidth: 720,
        animation: "fadeUp 0.6s 0.1s ease both",
      }}>
        <div className="glass-bright" style={{ padding: "32px" }}>

          {/* Input row */}
          <div style={{
            display: "flex",
            gap: 10,
            marginBottom: displayError ? 8 : 20,
            position: "relative",
          }}>
            <div style={{
              flex: 1,
              position: "relative",
              transition: "all 0.2s",
            }}>
              <Link2
                size={16}
                color={isFocused ? "var(--cyan)" : "var(--text-3)"}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  transition: "color 0.2s",
                  pointerEvents: "none",
                }}
              />
              <input
                ref={inputRef}
                id="repo-url-input"
                className="cs-input"
                type="text"
                value={url}
                onChange={(e) => {
                  // Sanitize input: allow only common URL characters
                  const sanitizedUrl = e.target.value.replace(/[^a-zA-Z0-9:/._-]/g, "");
                  setUrl(sanitizedUrl);
                  setLocalError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="https://github.com/owner/repository"
                disabled={isLoading}
                style={{ paddingLeft: 42, fontSize: "0.88rem" }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleScan()}
              disabled={isLoading}
              style={{ padding: "14px 22px", fontSize: "0.9rem", borderRadius: 10, flexShrink: 0 }}
            >
              {isLoading ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Search size={16} />
              )}
              {isLoading ? "Scanning..." : "Scan Now"}
            </button>
          </div>

          {/* Error message */}
          {displayError && (
            <div style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: "rgba(255,51,102,0.08)",
              border: "1px solid rgba(255,51,102,0.25)",
              borderRadius: 8,
              color: "var(--red)",
              fontSize: "0.83rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "slideRight 0.3s ease",
            }}>
              <span>⚠</span>
              {displayError}
            </div>
          )}

          {/* Features row */}
          <div style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            {FEATURES.map((f) => (
              <div key={f.text} style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.75rem",
                color: "var(--text-3)",
              }}>
                <span style={{ color: "var(--cyan)" }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          {/* Example repos */}
          <div>
            <p style={{
              fontSize: "0.72rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
              fontFamily: "JetBrains Mono",
            }}>
              Try a known-vulnerable repo:
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EXAMPLE_REPOS.map((repo) => (
                <button
                  key={repo.label}
                  onClick={() => fillUrl(repo.url)}
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid rgba(255,255,255,0.07)`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.18s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = repo.color + "50";
                    e.currentTarget.style.background = repo.color + "0a";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <span style={{
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: "JetBrains Mono",
                    color: repo.color,
                    background: repo.color + "18",
                    border: `1px solid ${repo.color}30`,
                  }}>
                    {repo.badge}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-1)", fontFamily: "JetBrains Mono" }}>
                      {repo.label}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{repo.desc}</div>
                  </div>
                  <ChevronRight size={12} color="var(--text-3)" style={{ marginLeft: "auto" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live demo button */}
      <button
        className="btn btn-ghost"
        onClick={() => { setUrl("https://github.com/OWASP/NodeGoat"); onScan("https://github.com/OWASP/NodeGoat"); }}
        disabled={isLoading}
        style={{ padding: "10px 22px", fontSize: "0.85rem", animation: "fadeUp 0.6s 0.2s ease both" }}
      >
        <Play size={14} />
        Instant demo — scan OWASP NodeGoat
      </button>
    </section>
  );
}
