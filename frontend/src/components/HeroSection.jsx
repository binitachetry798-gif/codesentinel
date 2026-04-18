import { useEffect, useRef } from "react";
import { Shield, Zap, Lock, ChevronDown } from "lucide-react";

export default function HeroSection({ onStartScan }) {
  const dotsRef = useRef(null);

  useEffect(() => {
    const el = dotsRef.current;
    if (!el) return;
    let frame;
    let t = 0;
    const animate = () => {
      t += 0.0003;
      const x = Math.sin(t) * 20;
      const y = Math.cos(t * 0.7) * 15;
      el.style.transform = `translate(${x}px, ${y}px)`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 120px",
      }}
    >
      {/* Animated dot grid background */}
      <div
        ref={dotsRef}
        style={{
          position: "absolute",
          inset: "-60px",
          backgroundImage:
            "radial-gradient(circle, rgba(0,229,255,0.08) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
          willChange: "transform",
          zIndex: 0,
        }}
      />

      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "8%",
          width: 350,
          height: 350,
          background: "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 900,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            border: "1px solid var(--accent-cyan)",
            borderRadius: 999,
            background: "rgba(0,229,255,0.05)",
            animation: "fadeUp 0.6s ease forwards",
          }}
        >
          <Shield size={12} color="var(--accent-cyan)" />
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--accent-cyan)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            ✦ Agentic AI &nbsp;×&nbsp; Cyber Security
          </span>
          <Zap size={12} color="var(--accent-cyan)" />
        </div>

        {/* Main headline */}
        <div style={{ animation: "fadeUp 0.7s 0.1s ease both" }}>
          <h1
            className="mono"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Your Code Has Secrets.
            <br />
            <span style={{ color: "var(--accent-cyan)" }}>CodeSentinel Finds Them.</span>
          </h1>
        </div>

        {/* Subheading */}
        <p
          style={{
            maxWidth: 620,
            fontSize: "1.05rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            animation: "fadeUp 0.7s 0.2s ease both",
          }}
        >
          Paste any GitHub link. AI scans every file, identifies vulnerabilities, and gives you plain
          English explanations with exact code fixes. In under 2 minutes. Completely free.
        </p>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeUp 0.7s 0.3s ease both",
          }}
        >
          {[
            { value: "< 2 min", label: "Average scan time" },
            { value: "₹ 0", label: "Cost forever" },
            { value: "OWASP Top 10", label: "Coverage" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                className="mono"
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            animation: "fadeUp 0.7s 0.4s ease both",
          }}
        >
          {[
            { icon: <Lock size={13} />, text: "Zero Data Storage" },
            { icon: <Shield size={13} />, text: "OWASP Coverage" },
            { icon: <Zap size={13} />, text: "Powered by Llama 3.3" },
          ].map((pill) => (
            <span
              key={pill.text}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 999,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--accent-cyan)" }}>{pill.icon}</span>
              {pill.text}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStartScan}
          className="btn-primary"
          style={{ padding: "14px 36px", fontSize: "1rem", animation: "fadeUp 0.7s 0.5s ease both" }}
        >
          Start Scanning →
        </button>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          opacity: 0.5,
          animation: "fadeUp 1s 0.8s ease both",
        }}
        onClick={onStartScan}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
          Scroll to scan
        </span>
        <ChevronDown size={18} color="var(--text-secondary)" style={{ animation: "pulse-ring 1.5s infinite" }} />
      </div>
    </section>
  );
}
