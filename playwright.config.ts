import { defineConfig, devices } from "@playwright/test";

const PORT = 8788;
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobiel", use: { ...devices["Pixel 7"] }, testMatch: /navigatie|a11y|uiterlijk/ },
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
