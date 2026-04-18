import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

const STEPS = [
  "Connecting to GitHub repository...",
  "Fetching source code files...",
  "Filtering relevant files...",
  "Sending code to AI engine...",
  "Analyzing for vulnerabilities...",
  "Generating fixes and explanations...",
];

function extractRepoName(url) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return `${parts[0]} / ${parts[1]}`;
  } catch {
    return url;
  }
}

export default function ScanProgress({ repoUrl }) {
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [progressWidth, setProgressWidth] = useState("0%");

  useEffect(() => {
    // Start progress bar animation
    setTimeout(() => setProgressWidth("90%"), 100);

    // Reveal steps one by one every 4 seconds
    const interval = setInterval(() => {
      setRevealedSteps((prev) => {
        if (prev >= STEPS.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const repoName = extractRepoName(repoUrl);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "40px 24px",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #00e5ff, #00ff88)",
            width: progressWidth,
            transition: "width 30s cubic-bezier(0.1, 0, 0.3, 1)",
            boxShadow: "0 0 12px rgba(0,229,255,0.6)",
          }}
        />
      </div>

      {/* Repo name */}
      <div
        className="mono"
        style={{
          fontSize: "0.85rem",
          color: "var(--accent-cyan)",
          marginBottom: 48,
          letterSpacing: "0.05em",
          textAlign: "center",
        }}
      >
        🔍 {repoName}
      </div>

      {/* Radar animation */}
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 56 }}>
        {/* Rings */}
        {[0, 0.5, 1].map((delay, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid var(--accent-cyan)",
              animation: `pulse-ring 2s ${delay}s ease-out infinite`,
              opacity: 0.7,
            }}
          />
        ))}
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--accent-cyan)",
            boxShadow: "0 0 20px rgba(0,229,255,0.8)",
          }}
        />
      </div>

      {/* Steps list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          maxWidth: 420,
        }}
      >
        {STEPS.map((step, index) => {
          const isCompleted = index < revealedSteps - 1;
          const isActive = index === revealedSteps - 1;
          const isHidden = index >= revealedSteps;

          return (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: isHidden ? 0 : 1,
                transform: isHidden ? "translateX(-10px)" : "translateX(0)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              {/* Icon */}
              <div style={{ width: 20, flexShrink: 0 }}>
                {isCompleted && (
                  <CheckCircle size={18} color="var(--accent-green)" />
                )}
                {isActive && (
                  <Loader2
                    size={18}
                    color="var(--accent-cyan)"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
              </div>

              {/* Text */}
              <span
                className="mono"
                style={{
                  fontSize: "0.82rem",
                  color: isCompleted
                    ? "var(--text-secondary)"
                    : isActive
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  textDecoration: isCompleted ? "line-through" : "none",
                  letterSpacing: "0.02em",
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom text */}
      <div style={{ marginTop: 56, textAlign: "center" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 8 }}>
          Analyzing your repository — this takes about 60–90 seconds
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(136,153,170,0.5)",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.05em",
          }}
        >
          ⚠ Do not close this tab
        </p>
      </div>
    </div>
  );
}
