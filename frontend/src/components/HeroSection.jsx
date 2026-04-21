import { useEffect, useRef } from "react";
import { Shield, Zap, Lock, ChevronDown } from "lucide-react";

/* ── Animated Dot Grid ── */
function DotGrid() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0, frame;
    const animate = () => {
      t += 0.0004;
      el.style.transform = `translate(${Math.sin(t) * 18}px, ${Math.cos(t * 0.7) * 12}px)`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div ref={ref} style={{
      position: "absolute",
      inset: "-50px",
      backgroundImage: "radial-gradient(circle, rgba(0,229,255,0.07) 1px, transparent 1px)",
      backgroundSize: "30px 30px",
      pointerEvents: "none",
      willChange: "transform",
      zIndex: 0,
    }} />
  );
}

/* ── Floating Orb ── */
function Orb({ style }) {
  return (
    <div style={{
      position: "absolute",
      borderRadius: "50%",
      filter: "blur(80px)",
      pointerEvents: "none",
      ...style,
    }} />
  );
}

/* ── Stats (static — no counter) ── */
const STATS = [
  { value: "< 2 min",       label: "Average scan time" },
  { value: "OWASP Top 10",  label: "Coverage"          },
  { value: "Llama 3.3",     label: "AI model"          },
];

/* ── Feature pills ── */
const PILLS = [
  { icon: <Lock size={13} />,   text: "Zero Data Storage"   },
  { icon: <Shield size={13} />, text: "OWASP Coverage"       },
  { icon: <Zap size={13} />,    text: "Powered by Llama 3.3" },
];

export default function HeroSection({ onStartScan }) {
  return (
    <section
      className="mesh-bg"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 120px",
      }}
    >
      <DotGrid />

      {/* Gradient orbs */}
      <Orb style={{ width: 520, height: 520, top: "5%",  left: "-12%", background: "rgba(0,212,255,0.055)", animation: "float 7s ease-in-out infinite" }} />
      <Orb style={{ width: 420, height: 420, bottom: "8%", right: "-8%", background: "rgba(0,255,135,0.045)", animation: "float 8s 2s ease-in-out infinite" }} />
      <Orb style={{ width: 280, height: 280, top: "45%", right: "18%", background: "rgba(168,85,247,0.035)", animation: "float 6s 1s ease-in-out infinite" }} />

      {/* ── Content ── */}
      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 860,
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 18px",
          background: "rgba(0,212,255,0.06)",
          border: "1px solid rgba(0,212,255,0.22)",
          borderRadius: 999,
          marginBottom: 32,
          animation: "fadeUp 0.5s ease both",
          boxShadow: "0 0 20px rgba(0,212,255,0.08)",
        }}>
          <Shield size={12} color="var(--cyan)" />
          <span style={{
            fontFamily: "JetBrains Mono",
            fontSize: 11,
            color: "var(--cyan)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>
            ✦ Agentic AI &nbsp;×&nbsp; Cyber Security
          </span>
          <Zap size={12} color="var(--cyan)" />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "JetBrains Mono",
          fontSize: "clamp(2.1rem, 5.5vw, 3.8rem)",
          fontWeight: 700,
          lineHeight: 1.13,
          letterSpacing: "-0.02em",
          marginBottom: 24,
          animation: "fadeUp 0.6s 0.08s ease both",
        }}>
          <span style={{ color: "var(--text-1)", display: "block" }}>Your Code Is Hiding</span>
          <span className="text-gradient-cyan" style={{ display: "block" }}>Security Nightmares.</span>
        </h1>

        {/* Subheading — original text from spec */}
        <p style={{
          maxWidth: 600,
          fontSize: "clamp(0.92rem, 2vw, 1.05rem)",
          color: "var(--text-2)",
          lineHeight: 1.75,
          marginBottom: 36,
          animation: "fadeUp 0.6s 0.16s ease both",
        }}>
          Paste any GitHub link. AI scans every file, identifies vulnerabilities,
          and gives you plain English explanations with exact code fixes.
          In under 2 minutes. Completely free.
        </p>

        {/* Stats row — STATIC values, simple fade-in */}
        <div style={{
          display: "flex",
          gap: 40,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 32,
          animation: "fadeUp 0.6s 0.24s ease both",
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center",
              animation: `scaleIn 0.5s ${i * 90}ms ease both`,
            }}>
              <div style={{
                fontFamily: "JetBrains Mono",
                fontSize: "clamp(1.1rem, 2.5vw, 1.45rem)",
                fontWeight: 700,
                color: "var(--text-1)",
                letterSpacing: "-0.01em",
                lineHeight: 1,
                marginBottom: 6,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: "0.68rem",
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
          marginBottom: 40,
          animation: "fadeUp 0.6s 0.32s ease both",
        }}>
          {PILLS.map((p) => (
            <span key={p.text} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 999,
              fontSize: 12,
              color: "var(--text-2)",
              backdropFilter: "blur(8px)",
              transition: "border-color 0.2s, background 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)"; e.currentTarget.style.background = "rgba(0,212,255,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.035)"; }}
            >
              <span style={{ color: "var(--cyan)" }}>{p.icon}</span>
              {p.text}
            </span>
          ))}
        </div>

        {/* CTA — original label */}
        <button
          className="btn btn-primary"
          onClick={onStartScan}
          style={{
            padding: "15px 40px",
            fontSize: "1rem",
            borderRadius: 10,
            letterSpacing: "0.01em",
            animation: "fadeUp 0.6s 0.4s ease both",
            boxShadow: "0 0 32px rgba(0,212,255,0.35)",
          }}
        >
          Start Scanning →
        </button>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={onStartScan}
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          color: "var(--text-3)",
          animation: "fadeIn 1s 0.9s ease both",
          transition: "color 0.2s",
          zIndex: 1,
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--cyan)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}
      >
        <span style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontFamily: "JetBrains Mono",
        }}>
          Scroll to scan
        </span>
        <ChevronDown size={15} style={{ animation: "float 2s ease-in-out infinite" }} />
      </button>
    </section>
  );
}
