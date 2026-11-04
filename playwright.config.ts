import { defineConfig, devices } from "@playwright/test";

/**
 * Testes E2E contra o build de PRODUÇÃO (`next start`).
 * - Padrão: build público (modo demonstração desativado).
 * - E2E_DEMO=1: build com NEXT_PUBLIC_MODO_DEMO=1 para exercitar formulários e /admin.
 * - E2E_BASE_URL: testa uma URL já publicada (ex.: Vercel) em vez de subir o servidor local.
 */
const PORTA = 3100;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORTA}`;

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
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "unit", testMatch: /unit\.spec\.ts/ },
    { name: "desktop", testIgnore: /unit\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", testIgnore: /unit\.spec\.ts/, use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORTA}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
