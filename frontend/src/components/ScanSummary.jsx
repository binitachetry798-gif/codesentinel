import { useState, useEffect, useRef } from "react";
import { ExternalLink, Download, RotateCcw, Clipboard, Check, TrendingUp } from "lucide-react";

function getRiskConfig(score) {
  if (score <= 30) return { label: "LOW RISK",      color: "var(--green)",  gradient: "#00ff87" };
  if (score <= 60) return { label: "MEDIUM RISK",   color: "var(--yellow)", gradient: "#ffd700" };
  if (score <= 80) return { label: "HIGH RISK",     color: "var(--orange)", gradient: "#ff8c00" };
  return            { label: "CRITICAL RISK",        color: "var(--red)",    gradient: "#ff3366" };
}

function RiskGauge({ score }) {
  const [display, setDisplay] = useState(0);
  const [offset, setOffset] = useState(0);
  const radius = 58;
  const circ   = 2 * Math.PI * radius;
  const cfg     = getRiskConfig(score);
  const svgRef  = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * score));
      setOffset(circ - (eased * score / 100) * circ);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score, circ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: 156, height: 156 }}>
        {/* Glow ring */}
        <div style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${cfg.gradient}18 0%, transparent 70%)`,
        }} />
        <svg width="156" height="156" ref={svgRef} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx="78" cy="78" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          {/* Value arc */}
          <circle
            cx="78" cy="78" r={radius}
            fill="none"
            stroke={`url(#gaugeGradient-${score})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${cfg.gradient}80)` }}
          />
          <defs>
            <linearGradient id={`gaugeGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={cfg.gradient} stopOpacity="0.7" />
              <stop offset="100%" stopColor={cfg.gradient} />
            </linearGradient>
          </defs>
        </svg>
        {/* Center */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "JetBrains Mono",
            fontSize: "2.2rem",
            fontWeight: 700,
            color: cfg.color,
            lineHeight: 1,
          }}>{display}</span>
          <span style={{ fontSize: "0.6rem", color: "var(--text-3)", marginTop: 2 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontFamily: "JetBrains Mono",
        fontSize: "0.7rem",
        fontWeight: 700,
        color: cfg.color,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>{cfg.label}</span>
    </div>
  );
}

const SEV_CARDS = [
  { key: "critical_count", label: "Critical", color: "var(--red)",    bg: "rgba(255,51,102,0.08)",  border: "rgba(255,51,102,0.2)",  delay: 0 },
  { key: "high_count",     label: "High",     color: "var(--orange)", bg: "rgba(255,140,0,0.08)",   border: "rgba(255,140,0,0.2)",   delay: 60 },
  { key: "medium_count",   label: "Medium",   color: "var(--yellow)", bg: "rgba(255,215,0,0.07)",   border: "rgba(255,215,0,0.18)",  delay: 120 },
  { key: "low_count",      label: "Low",      color: "var(--green)",  bg: "rgba(0,255,135,0.06)",   border: "rgba(0,255,135,0.18)",  delay: 180 },
];

export default function ScanSummary({ stats, repoUrl, onReset }) {
  const [copied, setCopied] = useState(false);

  const repoName = (() => {
    try { const p = new URL(repoUrl).pathname.split("/").filter(Boolean); return `${p[0]}/${p[1]}`; }
    catch { return repoUrl; }
  })();

  const exportReport = () => {
    const lines = [
      "╔══════════════════════════════════════╗",
      "║     CodeSentinel Security Report      ║",
      "╚══════════════════════════════════════╝",
      "",
      `Repository  : ${repoUrl}`,
      `Scan Date   : ${new Date().toLocaleString()}`,
      `Risk Score  : ${stats.overall_risk_score}/100`,
      `Files       : ${stats.files_scanned} analyzed`,
      `Scan Time   : ${stats.scan_time_seconds}s`,
      "",
      "VULNERABILITY BREAKDOWN",
      "─────────────────────────",
      `  Critical : ${stats.critical_count}`,
      `  High     : ${stats.high_count}`,
      `  Medium   : ${stats.medium_count}`,
      `  Low      : ${stats.low_count}`,
      `  Total    : ${stats.total_vulnerabilities}`,
      "",
      "Generated by CodeSentinel · https://github.com/binitachetry798-gif/codesentinel",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `codesentinel-${repoName.replace("/", "-")}-${Date.now()}.txt`,
    });
    a.click();
  };

  const copySummary = () => {
    const text = `🛡️ CodeSentinel Report | ${repoName} | Risk Score: ${stats.overall_risk_score}/100 | Vulns: ${stats.total_vulnerabilities} (${stats.critical_count} Critical, ${stats.high_count} High, ${stats.medium_count} Medium, ${stats.low_count} Low) | ${repoUrl}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="glass" style={{
      marginBottom: 24,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Top gradient band */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent, var(--cyan), var(--green), transparent)",
        opacity: 0.6,
      }} />

      <div style={{ padding: "24px 24px 20px" }}>
        {/* Repo info bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
          paddingBottom: 18,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 7,
              color: "var(--cyan)",
              textDecoration: "none",
              fontFamily: "JetBrains Mono",
              fontSize: "0.9rem",
              fontWeight: 700,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            {repoName}
            <ExternalLink size={13} />
          </a>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Scan time", value: `${stats.scan_time_seconds}s` },
              { label: "Files analyzed", value: stats.files_scanned },
              { label: "Total issues", value: stats.total_vulnerabilities },
            ].map((m) => (
              <div key={m.label} style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "0.85rem", color: "var(--text-1)", fontWeight: 600 }}>{m.value}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gauge + Severity grid */}
        <div style={{
          display: "flex",
          gap: 32,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 22,
        }}>
          <RiskGauge score={stats.overall_risk_score} />

          {/* 2x2 severity grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            flex: 1,
            minWidth: 220,
          }}>
            {SEV_CARDS.map((c) => (
              <div key={c.key} style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: "14px",
                textAlign: "center",
                animation: `scaleIn 0.45s ${c.delay}ms ease both`,
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Background number watermark */}
                <div style={{
                  position: "absolute",
                  right: 6,
                  bottom: -8,
                  fontFamily: "JetBrains Mono",
                  fontSize: "3rem",
                  fontWeight: 900,
                  color: c.color,
                  opacity: 0.05,
                  pointerEvents: "none",
                  lineHeight: 1,
                }}>
                  {stats[c.key] || 0}
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "1.8rem", fontWeight: 700, color: c.color, lineHeight: 1, marginBottom: 4 }}>
                  {stats[c.key] || 0}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          paddingTop: 18,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <button className="btn btn-primary" onClick={exportReport} style={{ padding: "9px 18px", fontSize: "0.82rem", borderRadius: 8 }}>
            <Download size={13} />
            Export Report
          </button>
          <button className="btn btn-ghost" onClick={onReset} style={{ padding: "9px 16px", fontSize: "0.82rem", borderRadius: 8 }}>
            <RotateCcw size={13} />
            New Scan
          </button>
          <button className="btn btn-subtle" onClick={copySummary} style={{ padding: "9px 16px", fontSize: "0.82rem", borderRadius: 8 }}>
            {copied ? <Check size={13} /> : <Clipboard size={13} />}
            {copied ? "Copied!" : "Copy Summary"}
          </button>
        </div>
      </div>
    </div>
  );
}
