import { defineConfig, devices } from "@playwright/test";

const PORT = 8788;
const NO_WEBGL = ["--disable-webgl", "--disable-3d-apis"];
const WEBGL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  // De functionele tests draaien zonder WebGL: dat is meteen de verplichte terugvaloptie (poster + HTML-bediening).
  // De 3D-suite draait mét WebGL (SwiftShader) en controleert dat de machines live, zichtbaar en bedienbaar zijn.
  projects: [
    { name: "desktop", testIgnore: /drie-d/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: { args: NO_WEBGL } } },
    { name: "mobiel", use: { ...devices["Pixel 7"], launchOptions: { args: NO_WEBGL } }, testMatch: /navigatie|a11y|uiterlijk/ },
    { name: "3d-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: { args: WEBGL } }, testMatch: /drie-d/ },
    { name: "3d-mobiel", use: { ...devices["Pixel 7"], launchOptions: { args: WEBGL } }, testMatch: /drie-d/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `rm -rf .wrangler/e2e && npx wrangler d1 migrations apply martijndenbesten --local --persist-to .wrangler/e2e && npx wrangler dev --local --port ${PORT} --persist-to .wrangler/e2e --var ADMIN_TOKEN:e2e-admin-token-0123456789abcdef --var HASH_SECRET:e2e`,
        url: `${BASE_URL}/api/health`,
        timeout: 120_000,
        reuseExistingServer: false,
      },
});
