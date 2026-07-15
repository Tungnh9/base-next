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
import { signToken, requireRole } from "../auth"

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
