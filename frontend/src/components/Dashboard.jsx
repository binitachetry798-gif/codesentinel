import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Home, Filter, SortDesc, ChevronDown } from "lucide-react";
import DOMPurify from "dompurify";
import ScanSummary from "./ScanSummary";
import VulnerabilityCard from "./VulnerabilityCard";

const SEV_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const SEV_COLORS = {
  Critical: "var(--red)",
  High: "var(--orange)",
  Medium: "var(--yellow)",
  Low: "var(--green)",
  All: "var(--cyan)",
};

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (!location || !navigate) {
    throw new Error('Invalid location or navigate object');
  }

  const scanData  = location.state?.scanData;
  if (!scanData || typeof scanData !== 'object') {
    throw new Error('Invalid scan data');
  }

  const [filter, setFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { if (!scanData) navigate("/"); }, [scanData, navigate]);
  if (!scanData) return null;

  const { stats, repo_url, all_vulnerabilities, files } = scanData;
  const handleReset = () => navigate("/");

  // Sort then filter
  const sorted = [...(all_vulnerabilities || [])]
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4));

  const filtered = filter === "All" ? sorted : sorted.filter((v) => v.severity === filter);

  const filterOptions = ["All", "Critical", "High", "Medium", "Low"];

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>
      {/* ══ Navbar ══ */}
      <nav style={{
        position: "sticky",
        top: 0,
        height: 56,
        background: "rgba(2,4,9,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,212,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 100,
      }}>
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 8,
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={16} color="var(--cyan)" />
          </div>
          <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-1)" }}>
            CodeSentinel
          </span>
          <span style={{
            padding: "2px 8px",
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.15)",
            borderRadius: 4,
            fontSize: 10,
            color: "var(--cyan)",
            fontFamily: "JetBrains Mono",
            letterSpacing: "0.06em",
          }}>
            RESULTS
          </span>
        </div>

        {/* Right: severity badge + new scan */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {stats.critical_count > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px",
              background: "rgba(255,51,102,0.1)",
              border: "1px solid rgba(255,51,102,0.25)",
              borderRadius: 6,
              animation: "glow-pulse 2s ease-in-out infinite",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "var(--red)", fontFamily: "JetBrains Mono", fontWeight: 700 }}>
                {stats.critical_count} Critical
              </span>
            </div>
          )}
          <button
            className="btn btn-ghost"
            onClick={(e) => { e.preventDefault(); handleReset(); }}
            style={{ padding: "6px 14px", fontSize: "0.8rem", borderRadius: 7 }}
          >
            <Home size={13} />
            New Scan
          </button>
        </div>
      </nav>

      {/* ══ Main Content ══ */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 80px" }}>
        {/* Summary card */}
        <ScanSummary stats={stats} repoUrl={repo_url} onReset={handleReset} />

        {/* Files scanned chips */}
        {files?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-3)",
              fontFamily: "JetBrains Mono",
              marginBottom: 10,
            }}>
              Files Analyzed ({files.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {files.map((f) => {
                const score = f.risk_score || 0;
                const chipColor = score > 70 ? "var(--red)" : score > 40 ? "var(--orange)" : "var(--text-3)";
                return (
                  <div key={f.file} title={f.file} style={{
                    padding: "4px 10px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${score > 70 ? "rgba(255,51,102,0.2)" : score > 40 ? "rgba(255,140,0,0.15)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s",
                    cursor: "default",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  >
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: chipColor }}>
                      {DOMPurify.sanitize(f.file?.split("/").pop(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}
                    </span>
                    {score > 0 && (
                      <span style={{
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                        color: chipColor,
                        background: score > 40 ? `${chipColor}15` : "transparent",
                        padding: "0 4px",
                        borderRadius: 3,
                      }}>
                        {score}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vulnerabilities header + filter */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-3)",
              fontFamily: "JetBrains Mono",
            }}>
              Vulnerabilities
            </span>
            <span style={{
              padding: "2px 8px",
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: 999,
              fontFamily: "JetBrains Mono",
              fontSize: 11,
              color: "var(--cyan)",
            }}>
              {filtered.length} / {sorted.length}
            </span>
          </div>

          {/* Filter buttons */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: `1px solid ${filter === f ? SEV_COLORS[f] + "50" : "rgba(255,255,255,0.06)"}`,
                  background: filter === f ? `${SEV_COLORS[f]}10` : "rgba(255,255,255,0.02)",
                  color: filter === f ? SEV_COLORS[f] : "var(--text-3)",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                  cursor: "pointer",
                  fontWeight: filter === f ? 700 : 400,
                  transition: "all 0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Vulnerability list */}
        {filtered.length === 0 ? (
          <div className="glass" style={{ padding: "56px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>
              {filter === "All" ? "✅" : "🔍"}
            </div>
            <p style={{ color: "var(--green)", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: "0.95rem" }}>
              {filter === "All" ? "No vulnerabilities detected!" : `No ${filter} vulnerabilities`}
            </p>
            <p style={{ color: "var(--text-3)", fontSize: "0.82rem", marginTop: 8 }}>
              {filter === "All" ? "The scanned files appear to be clean. Great job!" : `Try selecting a different severity filter.`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((vuln, i) => (
              <VulnerabilityCard
                key={`${vuln.file || "f"}-${vuln.id || "v"}-${i}`}
                vulnerability={vuln}
                index={i}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "20px",
        borderTop: "1px solid rgba(255,255,255,0.03)",
        color: "var(--text-3)",
        fontSize: "0.7rem",
        fontFamily: "JetBrains Mono",
      }}>
        CodeSentinel · Cyber Nexus Hackathon 2026 · GGSIPU Delhi · Powered by Groq + Llama 3.3
      </footer>
    </div>
  );
}
