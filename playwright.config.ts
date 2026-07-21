import { defineConfig, devices } from "@playwright/test"

// Same root-level env vars the CI workflow (.github/workflows/ci.yml) sets
// for every job — mirrored here so `npx playwright test` behaves the same
// locally and in CI without needing a real backend (mock API mode).
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000"
process.env.NEXT_PUBLIC_APP_NAME ??= "base-next"
process.env.JWT_SECRET ??= "ci-placeholder-jwt-secret-at-least-32-characters-long"
process.env.SESSION_COOKIE_NAME ??= "session"
process.env.API_BASE_URL ??= "http://localhost:4000"
process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost:4000"
process.env.NEXT_PUBLIC_USE_MOCK_API ??= "true"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Build-then-start is more robust/production-like for E2E than `next dev`
  // (matches what CI actually deploys, avoids dev-only HMR/overlay noise).
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
