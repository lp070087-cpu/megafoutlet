import { defineConfig, devices } from "@playwright/test";

/**
 * Testes E2E contra o build de PRODUÇÃO (`next start`).
 * - E2E_DEMO=0: build público com NEXT_PUBLIC_MODO_DEMO=0.
 * - E2E_DEMO=1: build local com MEGA_ADMIN_DEMO_LOCAL=1 para exercitar formulários e /admin.
 * - E2E_BASE_URL: testa uma URL já publicada (ex.: Vercel) em vez de subir o servidor local.
 */
const PORTA = 3100;
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORTA}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/resultado.json" }]],
  use: {
    baseURL,
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "unit", testMatch: /unit\.spec\.ts/ },
    { name: "desktop", testIgnore: /unit\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", testIgnore: /unit\.spec\.ts/, use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `node node_modules/next/dist/bin/next start -H 127.0.0.1 -p ${PORTA}`,
        url: baseURL,
        env: { MEGA_ADMIN_DEMO_LOCAL: process.env.E2E_DEMO === "0" ? "0" : "1" },
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
