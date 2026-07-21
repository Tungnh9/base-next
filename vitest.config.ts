import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Playwright E2E specs (e2e/**) run via `npx playwright test`, not
    // vitest — they import `test` from "@playwright/test", which can only
    // execute inside Playwright's own runner. Without this exclude, vitest's
    // default *.spec.ts glob would pick them up and fail/hang.
    exclude: ["node_modules/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Set a few points below the actual baseline at the time this was
      // wired into CI (~84/69/75/85 — run `npm run test:coverage` for the
      // current per-file breakdown) so normal fluctuation doesn't fail the
      // build, while a real regression (e.g. a large untested addition)
      // still trips it. Raise these over time as coverage improves —
      // never lower them to make a failing build pass.
      thresholds: {
        statements: 80,
        branches: 65,
        functions: 70,
        lines: 80,
      },
    },
  },
})
