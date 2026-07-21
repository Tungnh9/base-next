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
  },
})
