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
    // three.js zit in één lazy chunk (~150 kB gzip) die pas laadt bij interactie met een 3D-machine
    chunkSizeWarningLimit: 650,
  },
  server: {
    proxy: { "/api": "http://127.0.0.1:8787" },
  },
});
