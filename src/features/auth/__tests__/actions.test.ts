import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../services", () => ({
  authService: {
    login: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  recordFailedAttempt: vi.fn(),
  resetRateLimit: vi.fn(),
}))

// next/navigation (redirect) and next-intl/server (getLocale) are already
// globally mocked in src/test/setup.ts — reuse those mocks here.
import { redirect } from "next/navigation"
import { loginAction, resetPasswordAction } from "../actions"
import { authService } from "../services"
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit"

const mockLogin = vi.mocked(authService.login)
const mockResetPassword = vi.mocked(authService.resetPassword)
const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockRecordFailedAttempt = vi.mocked(recordFailedAttempt)
const mockResetRateLimit = vi.mocked(resetRateLimit)
const mockRedirect = vi.mocked(redirect)

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

  it("returns tooManyAttempts with retryAfterMs and never calls authService.login when the rate limit denies", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 60_000 })

    const result = await loginAction({}, formDataFor("user@example.com"))

    expect(result).toEqual({ error: "tooManyAttempts", retryAfterMs: 60_000 })
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

describe("resetPasswordAction — clears login lockout on success", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function formDataForReset() {
    const fd = new FormData()
    fd.set("password", "newpassword123")
    fd.set("confirmPassword", "newpassword123")
    fd.set("token", "demo-reset-token")
    return fd
  }

  it("clears the login rate limit for the email the server resolved the token to", async () => {
    mockResetPassword.mockResolvedValue("User@Example.com")

    await resetPasswordAction({}, formDataForReset())

    expect(mockResetRateLimit).toHaveBeenCalledWith("user@example.com")
    expect(mockRedirect).toHaveBeenCalledWith("/vi/login")
  })

  // Regression test for a real vulnerability: resetPasswordAction used to
  // read `email` straight from the submitted FormData and use it to clear
  // the rate limit, with no check that it matched the token's actual owner.
  // That let an attacker request their own valid reset token, submit it
  // alongside a victim's email, and clear the victim's login lockout —
  // completely defeating the brute-force protection. The email must now
  // come only from authService.resetPassword()'s server-verified return
  // value, never from client input.
  it("ignores a client-submitted email and only trusts the server-verified one", async () => {
    mockResetPassword.mockResolvedValue("real-owner@example.com")

    const fd = formDataForReset()
    fd.set("email", "victim@example.com")
    await resetPasswordAction({}, fd)

    expect(mockResetRateLimit).toHaveBeenCalledWith("real-owner@example.com")
    expect(mockResetRateLimit).not.toHaveBeenCalledWith("victim@example.com")
  })

  it("does not clear the rate limit when the reset itself fails", async () => {
    mockResetPassword.mockRejectedValue(new Error("invalid token"))

    const result = await resetPasswordAction({}, formDataForReset())

    expect(result).toEqual({ error: "resetPasswordFailed" })
    expect(mockResetRateLimit).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
