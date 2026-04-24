import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true, // required for virtual hosted sites
        secure: false, // development only
      },
    },
  },
  // In production, VITE_API_URL is set via Vercel env vars
  // API calls go directly to Render backend (no proxy in prod)
});
