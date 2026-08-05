// @vitest-environment node
// jose needs the real Node Uint8Array/TextEncoder realm — jsdom's globals fail
// its `instanceof Uint8Array` checks during sign/verify.
import { describe, it, expect, vi, beforeEach } from "vitest"

// Override the global next/navigation mock (a no-op vi.fn() set in src/test/setup.ts)
// so redirect() actually halts control flow here, matching real Next.js behavior.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

let cookieValue: string | undefined
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "session" ? { value: cookieValue } : undefined),
  }),
}))

import { redirect } from "next/navigation"
import {
  signToken,
  requireRole,
  requireSession,
  unauthorizedError,
  forbiddenError,
  validationError,
} from "../auth"

describe("requireRole", () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear()
    cookieValue = undefined
  })

  it("redirects to /login when there is no session", async () => {
    await expect(requireRole("vi", ["admin"])).rejects.toThrow("REDIRECT:/vi/login")
  })

  it("redirects to /not-authorized when the role doesn't match", async () => {
    cookieValue = await signToken({ userId: "1", email: "user@example.com", role: "user" })

    await expect(requireRole("vi", ["admin"])).rejects.toThrow("REDIRECT:/vi/not-authorized")
  })

  it("returns the session when the role matches", async () => {
    cookieValue = await signToken({ userId: "1", email: "admin@example.com", role: "admin" })

    await expect(requireRole("vi", ["admin"])).resolves.toMatchObject({ role: "admin" })
  })
})

describe("requireSession", () => {
  beforeEach(() => {
    cookieValue = undefined
  })

  it("returns null when there is no session — never redirects", async () => {
    await expect(requireSession()).resolves.toBeNull()
  })

  it("returns the decoded session when a valid cookie is present", async () => {
    cookieValue = await signToken({ userId: "1", email: "user@example.com", role: "user" })

    await expect(requireSession()).resolves.toMatchObject({ userId: "1", role: "user" })
  })
})

describe("unauthorizedError", () => {
  it("returns a 401 ApiError shape", () => {
    expect(unauthorizedError()).toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
      message: expect.any(String),
    })
  })
})

describe("forbiddenError", () => {
  it("returns a 403 ApiError shape, distinct from unauthorizedError's 401", () => {
    expect(forbiddenError()).toMatchObject({
      code: "FORBIDDEN",
      status: 403,
      message: expect.any(String),
    })
  })
})

describe("validationError", () => {
  it("returns a 400 ApiError shape with a translated (locale-aware) message", async () => {
    // next-intl/server is globally mocked in src/test/setup.ts to
    // `getTranslations: async () => (key) => key` — so this proves the
    // message goes through the translation function rather than being a
    // hardcoded literal, without needing a real i18n provider in this test.
    await expect(validationError()).resolves.toMatchObject({
      code: "VALIDATION_ERROR",
      status: 400,
      message: "invalidData",
    })
  })
})
