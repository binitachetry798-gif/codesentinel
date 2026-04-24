import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "isomorphic-dompurify";
import HeroSection from "./components/HeroSection";
import ScanInput from "./components/ScanInput";
import ScanProgress from "./components/ScanProgress";
import Dashboard from "./components/Dashboard";
import Toast from "./components/Toast";

// In production (Vercel), use the Render backend URL from env var
const API_BASE = import.meta.env.VITE_API_URL || "";

function HomePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanningRepo, setScanningRepo] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    // Sanitize toast message
    setToast({ message: DOMPurify.sanitize(message), type });
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
      
      const validateScanData = (data) => {
        if (!data || typeof data !== "object") return null;
        if (!data.stats || typeof data.stats !== "object") {
          data.stats = { total_vulnerabilities: 0, critical_count: 0, high_count: 0, medium_count: 0, low_count: 0, overall_risk_score: 0, files_scanned: 0, scan_time_seconds: 0 };
        }
        if (!Array.isArray(data.all_vulnerabilities)) data.all_vulnerabilities = [];
        if (!Array.isArray(data.files)) data.files = [];
        return data;
      };
      
      const validatedUrl = validateRepoUrl(repoUrl);
      const response = await axios.post(`${API_BASE}/api/scan`, { 
        repoUrl: encodeURIComponent(validatedUrl) 
      });

      if (response.data.success) {
        const validatedScanData = validateScanData(response.data);
        if (validatedScanData) {
          // Deep clone scanData to prevent side effects
          const scanDataClone = JSON.parse(JSON.stringify(validatedScanData));
          navigate("/results", { state: { scanData: scanDataClone } });
        } else {
          const errMsg = "Invalid scan data received from server.";
          setScanError(errMsg);
          showToast(errMsg, "error");
        }
      } else {
        const errMsg = response.data.error || "Scan failed. Please try again.";
        setScanError(errMsg);
        showToast(errMsg, "error");
        setIsScanning(false);
      }
    } catch (err) {
      // Use generic error message for the UI
      const genericMsg = "Scan failed. Please verify the URL and try again.";
      console.error("Scan failed:", err.message);
      
      setScanError(genericMsg);
      showToast(genericMsg, "error");
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return <ScanProgress repoUrl={scanningRepo} />;
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
