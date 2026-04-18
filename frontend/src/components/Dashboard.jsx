import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Home } from "lucide-react";
import ScanSummary from "./ScanSummary";
import VulnerabilityCard from "./VulnerabilityCard";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const scanData = location.state?.scanData;

  useEffect(() => {
    if (!scanData) navigate("/");
  }, [scanData, navigate]);

  if (!scanData) return null;

  const { stats, repo_url, all_vulnerabilities, files } = scanData;

  const handleReset = () => navigate("/");

  const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const sorted = [...(all_vulnerabilities || [])].sort(
    (a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ── Fixed Navbar ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          height: 56,
          background: "rgba(6,10,20,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-glow)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={20} color="var(--accent-cyan)" />
          <span
            className="mono"
            style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}
          >
            CodeSentinel
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "2px 7px",
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.2)",
              borderRadius: 999,
              color: "var(--accent-cyan)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
            }}
          >
            RESULTS
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Vulnerability count badge */}
          {stats.critical_count > 0 && (
            <span
              style={{
                padding: "3px 10px",
                background: "rgba(255,45,85,0.12)",
                border: "1px solid var(--danger-red)",
                borderRadius: 999,
                fontSize: 11,
                color: "var(--danger-red)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
              }}
            >
              {stats.critical_count} Critical
            </span>
          )}
          <button
            className="btn-ghost"
            onClick={handleReset}
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
          >
            <Home size={14} />
            New Scan
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Summary */}
        <ScanSummary stats={stats} repoUrl={repo_url} onReset={handleReset} />

        {/* File results overview */}
        {files && files.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2
              className="mono"
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            >
              Files Analyzed ({files.length})
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {files.map((f) => {
                const riskColor =
                  f.risk_score > 70
                    ? "var(--danger-red)"
                    : f.risk_score > 40
                    ? "var(--warning-orange)"
                    : "var(--text-secondary)";
                return (
                  <div
                    key={f.file}
                    title={f.file}
                    style={{
                      padding: "4px 10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: riskColor,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{f.file?.split("/").pop()}</span>
                    {f.risk_score > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          opacity: 0.7,
                          color: riskColor,
                        }}
                      >
                        {f.risk_score}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vulnerabilities */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h2
              className="mono"
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-secondary)",
              }}
            >
              Vulnerabilities ({sorted.length})
            </h2>
          </div>

          {sorted.length === 0 ? (
            <div
              className="glass-card"
              style={{ padding: "48px", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>✅</div>
              <p style={{ color: "var(--accent-green)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                No vulnerabilities detected!
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 8 }}>
                The scanned files appear to be clean. Great job!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sorted.map((vuln, i) => (
                <VulnerabilityCard key={`${vuln.file || "f"}-${vuln.id || "v"}-${i}`} vulnerability={vuln} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          color: "var(--text-secondary)",
          fontSize: "0.75rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        CodeSentinel — Cyber Nexus Hackathon 2026 · GGSIPU Delhi · Built with Groq + Llama 3.3
      </footer>
    </div>
  );
}
