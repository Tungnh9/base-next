import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../services", () => ({
  authService: {
    login: vi.fn(),
  },
}))

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  recordFailedAttempt: vi.fn(),
  resetRateLimit: vi.fn(),
}))

import { loginAction } from "../actions"
import { authService } from "../services"
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit"

const mockLogin = vi.mocked(authService.login)
const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockRecordFailedAttempt = vi.mocked(recordFailedAttempt)
const mockResetRateLimit = vi.mocked(resetRateLimit)

function formDataFor(email: string, password = "password123") {
  const fd = new FormData()
  fd.set("email", email)
  fd.set("password", password)
  return fd
}

describe("loginAction — rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 5, retryAfterMs: 0 })
  })

  it("returns tooManyAttempts and never calls authService.login when the rate limit denies", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 60_000 })

    const result = await loginAction({}, formDataFor("user@example.com"))

    expect(result).toEqual({ error: "tooManyAttempts" })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it("records a failed attempt when authService.login rejects", async () => {
    mockLogin.mockRejectedValue(new Error("invalid credentials"))

    const result = await loginAction({}, formDataFor("user@example.com"))

    expect(result).toEqual({ error: "loginFailed" })
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({ max: 5 })
    )
    expect(mockResetRateLimit).not.toHaveBeenCalled()
  })

  it("resets the rate limit on a fully successful login", async () => {
    mockLogin.mockResolvedValue({ requiresTwoFactor: false, user: { id: "1" } as never })

    const result = await loginAction({}, formDataFor("user@example.com"))

    expect(result).toEqual({ success: true, user: { id: "1" } })
    expect(mockResetRateLimit).toHaveBeenCalledWith("user@example.com")
    expect(mockRecordFailedAttempt).not.toHaveBeenCalled()
  })

  it("resets the rate limit when login succeeds into the 2FA branch", async () => {
    mockLogin.mockResolvedValue({ requiresTwoFactor: true, twoFactorPhone: "+849xxxx" })

    await loginAction({}, formDataFor("user@example.com"))

    expect(mockResetRateLimit).toHaveBeenCalledWith("user@example.com")
  })

  it("does not consume a rate-limit check for malformed input (schema validation failure)", async () => {
    const result = await loginAction({}, formDataFor("not-an-email"))

    expect(result).toEqual({ error: "invalidCredentials" })
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it("normalizes email case to the same rate-limit key", async () => {
    mockLogin.mockRejectedValue(new Error("bad creds"))

    await loginAction({}, formDataFor("User@Example.com"))

    expect(mockCheckRateLimit).toHaveBeenCalledWith("user@example.com", expect.any(Object))
  })
})
