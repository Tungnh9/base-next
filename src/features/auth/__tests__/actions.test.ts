import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../services", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  recordFailedAttempt: vi.fn(),
  resetRateLimit: vi.fn(),
}))

import { loginAction, registerAction, resetPasswordAction } from "../actions"
import { authService } from "../services"
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit"

const mockLogin = vi.mocked(authService.login)
const mockRegister = vi.mocked(authService.register)
const mockResetPassword = vi.mocked(authService.resetPassword)
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

describe("registerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function formDataForRegister(overrides: Partial<Record<string, string>> = {}) {
    const fd = new FormData()
    fd.set("username", overrides.username ?? "johndoe")
    fd.set("email", overrides.email ?? "user@example.com")
    fd.set("password", overrides.password ?? "password123")
    return fd
  }

  it("returns success (no server redirect) when registration succeeds", async () => {
    mockRegister.mockResolvedValue(undefined)

    const result = await registerAction({}, formDataForRegister())

    expect(result).toEqual({ success: true })
  })

  it("returns registerFailed when the schema rejects malformed input", async () => {
    const result = await registerAction({}, formDataForRegister({ username: "a" }))

    expect(result).toEqual({ error: "registerFailed" })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it("returns registerFailed when authService.register rejects", async () => {
    mockRegister.mockRejectedValue(new Error("email already taken"))

    const result = await registerAction({}, formDataForRegister())

    expect(result).toEqual({ error: "registerFailed" })
  })
})

describe("resetPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function formDataForReset(password = "NewPass123!") {
    const fd = new FormData()
    fd.set("password", password)
    fd.set("confirmPassword", password)
    fd.set("token", "demo-reset-token")
    return fd
  }

  it("returns success and clears the login rate limit for the email the server resolved the token to", async () => {
    mockResetPassword.mockResolvedValue("User@Example.com")

    const result = await resetPasswordAction({}, formDataForReset())

    expect(result).toEqual({ success: true })
    expect(mockResetPassword).toHaveBeenCalledWith({
      password: "NewPass123!",
      token: "demo-reset-token",
    })
    expect(mockResetRateLimit).toHaveBeenCalledWith("user@example.com")
  })

  it("returns resetPasswordFailed when the password fails the strength schema", async () => {
    const result = await resetPasswordAction({}, formDataForReset("weak"))

    expect(result).toEqual({ error: "resetPasswordFailed" })
    expect(mockResetPassword).not.toHaveBeenCalled()
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

  it("returns resetPasswordFailed when authService.resetPassword rejects, and does not clear the rate limit", async () => {
    mockResetPassword.mockRejectedValue(new Error("invalid or expired token"))

    const result = await resetPasswordAction({}, formDataForReset())

    expect(result).toEqual({ error: "resetPasswordFailed" })
    expect(mockResetRateLimit).not.toHaveBeenCalled()
  })
})
