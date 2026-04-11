// ══════════════════════════════════════════════════════════════════
// Playwright Configuration for SENTINNEL E2E Tests
// ══════════════════════════════════════════════════════════════════

const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./",
  fullyParallel: false, // Ejecutar tests en serie para mejor control
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:9000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true, // Modo headless para entorno sin GUI
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Timeout extendido para pruebas de WebSocket
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
