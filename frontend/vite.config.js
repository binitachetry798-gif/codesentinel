import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  // In production, VITE_API_URL is set via Vercel env vars
  // API calls go directly to Render backend (no proxy in prod)
});
