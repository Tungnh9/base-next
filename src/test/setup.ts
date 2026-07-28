import "@testing-library/jest-dom"
import { vi } from "vitest"

// Env vars required by @/lib/env — set before any module import
process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-32-characters-long"
process.env.API_BASE_URL = "http://localhost:4000"
process.env.NODE_ENV = "test"

// jsdom has no ResizeObserver — Radix primitives (e.g. Checkbox) call it on mount
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom has no URL.createObjectURL/revokeObjectURL — needed by the customer
// avatar picker's local file preview
global.URL.createObjectURL = vi.fn(() => "blob:mock-object-url")
global.URL.revokeObjectURL = vi.fn()

// jsdom has no pointer-capture APIs or scrollIntoView — Radix Select calls
// these when a trigger is clicked/opened via userEvent, needed for any test
// that opens a Select dropdown and picks an option. Guarded since some test
// files in this project run in the "node" environment (no DOM at all).
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
}

// next/navigation — redirect, router, pathname
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/vi/test",
  useSearchParams: () => new URLSearchParams(),
}))

// next-intl — useTranslations returns key as value, no throws
vi.mock("next-intl", () => {
  const t = (key: string) => key
  t.rich = (key: string) => key
  return {
    useTranslations: () => t,
    useLocale: () => "vi",
  }
})
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
  getLocale: async () => "vi",
  getMessages: async () => ({}),
}))
