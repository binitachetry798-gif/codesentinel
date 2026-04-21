import { useState, useEffect } from "react";
import { CheckCircle, Loader2, Terminal, Cpu } from "lucide-react";

const STEPS = [
  { label: "Connecting to GitHub API...", icon: "🔗" },
  { label: "Fetching repository file tree...", icon: "📂" },
  { label: "Filtering source code files...", icon: "🔍" },
  { label: "Sending files to Llama 3.3 AI...", icon: "🤖" },
  { label: "Analyzing security vulnerabilities...", icon: "🛡️" },
  { label: "Generating code fixes & explanations...", icon: "✍️" },
];

const TERMINAL_LINES = [
  "> Initializing CodeSentinel scanner...",
  "> Loading OWASP vulnerability database...",
  "> Connecting to GitHub REST API...",
  "> Parsing repository structure...",
  "> Filtering 847 files → 15 code files selected",
  "> Loading Llama 3.3-70B model...",
  "> [1/15] Analyzing app/routes/index.js",
  "> [2/15] Analyzing app/data/user-dao.js",
  "> ⚠ SQL Injection detected on line 47",
  "> [3/15] Analyzing app/routes/auth.js",
  "> ⚠ Broken Authentication on line 12",
  "> Generating vulnerability report...",
  "> Computing OWASP mappings...",
  "> Generating code fixes...",
  "> Scan complete. Building results dashboard...",
];

function extractRepoName(url) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return `${parts[0]} / ${parts[1]}`;
  } catch { return url; }
}

export default function ScanProgress({ repoUrl }) {
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Progress bar
    const progressTimer = setTimeout(() => setProgressWidth(90), 200);

    // Steps
    const stepInterval = setInterval(() => {
      setRevealedSteps((p) => Math.min(p + 1, STEPS.length));
    }, 4200);

    // Terminal lines
    let lineIdx = 0;
    const terminalInterval = setInterval(() => {
      if (lineIdx < TERMINAL_LINES.length) {
        setTerminalLines((prev) => [...prev, TERMINAL_LINES[lineIdx]]);
        lineIdx++;
      } else {
        clearInterval(terminalInterval);
      }
    }, 3800);

    // Dots animation
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);

    return () => {
      clearTimeout(progressTimer);
      clearInterval(stepInterval);
      clearInterval(terminalInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  const repoName = extractRepoName(repoUrl);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "var(--bg-0)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      overflow: "hidden",
    }}>
      {/* Animated background grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(0,212,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }} />

      {/* Background orbs */}
      <div style={{
        position: "absolute",
        top: "20%", left: "10%",
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
        filter: "blur(40px)",
        animation: "float 6s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3,
        background: "rgba(255,255,255,0.04)",
        zIndex: 1000,
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, #00d4ff, #00ff87, #00d4ff)",
          backgroundSize: "200% 100%",
          animation: "gradient-shift 2s linear infinite",
          width: `${progressWidth}%`,
          transition: `width 28s cubic-bezier(0.1, 0, 0.3, 1)`,
          boxShadow: "0 0 12px rgba(0,212,255,0.7)",
        }} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
        maxWidth: 900,
        width: "100%",
        padding: "0 24px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Left: Scanner animation + Steps */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>

          {/* Radar */}
          <div>
            {/* Repo name */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                Scanning Repository
              </div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: "0.95rem", color: "var(--cyan)", fontWeight: 600 }}>
                {repoName}
              </div>
            </div>

            {/* Radar graphic */}
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto" }}>
              {[0, 0.6, 1.2].map((delay, i) => (
                <div key={i} style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "1.5px solid var(--cyan)",
                  animation: `pulseRing 2.4s ${delay}s ease-out infinite`,
                }} />
              ))}
              <div style={{
                position: "absolute",
                inset: "30%",
                borderRadius: "50%",
                background: "var(--cyan)",
                boxShadow: "0 0 24px rgba(0,212,255,0.8)",
              }} />
              <div style={{
                position: "absolute",
                inset: "40%",
                borderRadius: "50%",
                background: "white",
              }} />
            </div>
          </div>

          {/* Steps */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            {STEPS.map((step, i) => {
              const done = i < revealedSteps - 1;
              const active = i === revealedSteps - 1;
              const hidden = i >= revealedSteps;
              return (
                <div key={step.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: active ? "rgba(0,212,255,0.06)" : "transparent",
                  border: active ? "1px solid rgba(0,212,255,0.15)" : "1px solid transparent",
                  opacity: hidden ? 0 : 1,
                  transform: hidden ? "translateX(-12px)" : "none",
                  transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                }}>
                  <div style={{ width: 22, flexShrink: 0, textAlign: "center" }}>
                    {done && <CheckCircle size={16} color="var(--green)" />}
                    {active && <Loader2 size={16} color="var(--cyan)" style={{ animation: "spin 1s linear infinite" }} />}
                    {hidden && <span style={{ fontSize: 13 }}>{step.icon}</span>}
                  </div>
                  <span style={{
                    fontSize: "0.78rem",
                    fontFamily: "JetBrains Mono",
                    color: done ? "var(--text-3)" : active ? "var(--text-1)" : "var(--text-3)",
                    textDecoration: done ? "line-through" : "none",
                    letterSpacing: "0.01em",
                  }}>
                    {step.label}
                  </span>
                  {active && (
                    <span style={{ marginLeft: "auto", fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--cyan)" }}>
                      {dots}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Terminal */}
        <div className="glass" style={{
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Terminal header */}
          <div style={{
            padding: "10px 14px",
            background: "rgba(0,0,0,0.4)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}>
              <Terminal size={12} color="var(--text-3)" />
              <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "JetBrains Mono" }}>codesentinel — scanner</span>
            </div>
            <Cpu size={12} color="var(--cyan)" style={{ animation: "spin 3s linear infinite" }} />
          </div>

          {/* Terminal body */}
          <div style={{
            flex: 1,
            padding: "14px",
            overflowY: "auto",
            minHeight: 280,
            fontFamily: "JetBrains Mono",
            fontSize: "0.72rem",
            lineHeight: 1.8,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}>
            {terminalLines.map((line, i) => {
              if (!line) return null;
              const isWarning = line.includes("⚠");
              const isComplete = line.includes("complete") || line.includes("Scan complete");
              return (
                <div key={i} style={{
                  color: isWarning ? "var(--orange)" : isComplete ? "var(--green)" : "var(--text-3)",
                  animation: "slideRight 0.3s ease",
                }}>
                  {line}
                </div>
              );
            })}
            {terminalLines.length < TERMINAL_LINES.length && (
              <span style={{ color: "var(--cyan)", animation: "blink 1s step-end infinite" }}>█</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: 32 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: 6 }}>
          AI analyzing every line of code — takes about 60–90 seconds
        </p>
        <p style={{ fontSize: "0.7rem", color: "var(--text-3)", fontFamily: "JetBrains Mono", opacity: 0.5 }}>
          ⚠ Do not close this tab
        </p>
      </div>
    </div>
  );
}
