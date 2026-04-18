import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

const CONFIG = {
  error: { icon: <AlertCircle size={16} />, color: "var(--danger-red)", bg: "rgba(255,45,85,0.12)", border: "rgba(255,45,85,0.3)" },
  success: { icon: <CheckCircle size={16} />, color: "var(--accent-green)", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.3)" },
  info: { icon: <Info size={16} />, color: "var(--accent-cyan)", bg: "rgba(0,229,255,0.08)", border: "rgba(0,229,255,0.2)" },
};

export default function Toast({ message, type = "error", onClose }) {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[type] || CONFIG.error;

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 99999,
        maxWidth: 380,
        padding: "12px 16px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 10,
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }}
    >
      <span style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1, fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
        {message}
      </span>
      <button
        onClick={handleClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          padding: 2,
          flexShrink: 0,
          display: "flex",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
