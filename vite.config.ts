import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
    target: "es2022",
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    manifest: true,
  },
  server: {
    proxy: { "/api": "http://127.0.0.1:8787" },
  },
});
