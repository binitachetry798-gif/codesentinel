import { useState, useEffect } from "react";
import { ExternalLink, Download, RotateCcw, Clipboard, Check } from "lucide-react";

function getRiskLabel(score) {
  if (score <= 30) return { label: "LOW RISK", color: "var(--accent-green)" };
  if (score <= 60) return { label: "MEDIUM RISK", color: "var(--warning-yellow)" };
  if (score <= 80) return { label: "HIGH RISK", color: "var(--warning-orange)" };
  return { label: "CRITICAL RISK", color: "var(--danger-red)" };
}

function RiskGauge({ score }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(754);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const { label, color } = getRiskLabel(score);

  useEffect(() => {
    // Animate score count up
    const duration = 1200;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(easedProgress * score));
      setDashOffset(circumference - (easedProgress * score / 100) * circumference);
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [score, circumference]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {/* Foreground arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.5s ease" }}
          />
        </svg>
        {/* Center label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="mono"
            style={{ fontSize: "2rem", fontWeight: 700, color, lineHeight: 1 }}
          >
            {displayScore}
          </span>
          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: 2 }}>
            / 100
          </span>
        </div>
      </div>
      <span
        className="mono"
        style={{ fontSize: "0.75rem", fontWeight: 700, color, letterSpacing: "0.1em" }}
      >
        {label}
      </span>
    </div>
  );
}

const SEVERITY_CARDS = [
  { key: "critical_count", label: "Critical", bg: "rgba(255,45,85,0.12)", border: "var(--danger-red)", textColor: "#fff", delay: 0 },
  { key: "high_count", label: "High", bg: "rgba(255,149,0,0.12)", border: "var(--warning-orange)", textColor: "#fff", delay: 80 },
  { key: "medium_count", label: "Medium", bg: "rgba(255,214,10,0.1)", border: "var(--warning-yellow)", textColor: "var(--warning-yellow)", delay: 160 },
  { key: "low_count", label: "Low", bg: "rgba(0,255,136,0.08)", border: "var(--accent-green)", textColor: "var(--accent-green)", delay: 240 },
];

export default function ScanSummary({ stats, repoUrl, onReset }) {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const repoName = (() => {
    try {
      const parts = new URL(repoUrl).pathname.split("/").filter(Boolean);
      return `${parts[0]}/${parts[1]}`;
    } catch {
      return repoUrl;
    }
  })();

  const exportReport = () => {
    const date = new Date().toLocaleString();
    const lines = [
      "=== CodeSentinel Security Report ===",
      `Repository: ${repoUrl}`,
      `Scan Date: ${date}`,
      `Risk Score: ${stats.overall_risk_score}/100`,
      `Total Vulnerabilities: ${stats.total_vulnerabilities}`,
      `  Critical: ${stats.critical_count}`,
      `  High: ${stats.high_count}`,
      `  Medium: ${stats.medium_count}`,
      `  Low: ${stats.low_count}`,
      `Files Scanned: ${stats.files_scanned}`,
      `Scan Time: ${stats.scan_time_seconds}s`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `codesentinel-report-${Date.now()}.txt`;
    a.click();
  };

  const copySummary = () => {
    const text = `CodeSentinel Report | ${repoName} | Risk: ${stats.overall_risk_score}/100 | Vulns: ${stats.total_vulnerabilities} (${stats.critical_count} Critical, ${stats.high_count} High)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    });
  };

  return (
    <div className="glass-card" style={{ padding: "28px 28px", marginBottom: 28 }}>
      {/* ── Top Info Bar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--accent-cyan)",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          {repoName}
          <ExternalLink size={14} />
        </a>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
          Scanned in {stats.scan_time_seconds}s &nbsp;•&nbsp; {stats.files_scanned} files analyzed
        </span>
      </div>

      {/* ── Main Content ── */}
      <div
        style={{
          display: "flex",
          gap: 40,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        {/* Risk Gauge */}
        <RiskGauge score={stats.overall_risk_score} />

        {/* Severity Cards 2x2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            flex: 1,
            minWidth: 240,
          }}
        >
          {SEVERITY_CARDS.map((card) => (
            <div
              key={card.key}
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: 10,
                padding: "16px 14px",
                textAlign: "center",
                animation: `scaleIn 0.5s ${card.delay}ms ease both`,
              }}
            >
              <div
                className="mono"
                style={{ fontSize: "2rem", fontWeight: 700, color: card.textColor, lineHeight: 1 }}
              >
                {stats[card.key] || 0}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          className="btn-primary"
          onClick={exportReport}
          style={{ padding: "9px 18px", fontSize: "0.85rem" }}
        >
          <Download size={14} />
          Export Report
        </button>
        <button
          className="btn-ghost"
          onClick={onReset}
          style={{ padding: "9px 18px", fontSize: "0.85rem" }}
        >
          <RotateCcw size={14} />
          Scan Another Repo
        </button>
        <button
          className="btn-ghost"
          onClick={copySummary}
          style={{ padding: "9px 18px", fontSize: "0.85rem" }}
        >
          {copiedSummary ? <Check size={14} /> : <Clipboard size={14} />}
          {copiedSummary ? "Copied!" : "Copy Summary"}
        </button>
      </div>
    </div>
  );
}
