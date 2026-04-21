import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import HeroSection from "./components/HeroSection";
import ScanInput from "./components/ScanInput";
import ScanProgress from "./components/ScanProgress";
import Dashboard from "./components/Dashboard";
import Toast from "./components/Toast";

// In production (Vercel), use the Render backend URL from env var
// In dev, empty string → Vite proxy handles /api/* → localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || "";

function HomePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanningRepo, setScanningRepo] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleScan = async (repoUrl) => {
    setScanError("");
    setIsScanning(true);
    setScanningRepo(repoUrl);

    try {
      const validateRepoUrl = (url) => {
        if (!url || typeof url !== "string") return "";
        return url.trim().replace(/\.git$/, "").replace(/\/$/, "");
      };
      
      const response = await axios.post(`${API_BASE}/api/scan`, { repoUrl: validateRepoUrl(repoUrl) });
      if (response.data.success) {
        navigate("/results", { state: { scanData: response.data } });
      } else {
        setScanError(response.data.error || "Scan failed. Please try again.");
        showToast(response.data.error || "Scan failed.", "error");
        setIsScanning(false);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Connection failed. Is the backend running?";
      console.error('Scan failed:', msg);
      setScanError(msg);
      showToast(msg, "error");
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return <ScanProgress repoUrl={DOMPurify.sanitize(scanningRepo)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <HeroSection onStartScan={() => document.getElementById("scan-input-section")?.scrollIntoView({ behavior: "smooth" })} />
      <div id="scan-input-section">
        <ScanInput onScan={handleScan} isLoading={isScanning} error={scanError} />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
