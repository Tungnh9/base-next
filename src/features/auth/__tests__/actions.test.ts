import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../services", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
    forgotPassword: vi.fn(),
    verifyForgotPasswordCode: vi.fn(),
    logout: vi.fn(),
    getLogoutRedirect: vi.fn(() => "/login"),
    resendVerificationEmail: vi.fn(),
    verifyTwoStep: vi.fn(),
    resendTwoStepCode: vi.fn(),
  },
}))

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  recordFailedAttempt: vi.fn(),
  resetRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}))

import {
  loginAction,
  registerAction,
  resetPasswordAction,
  forgotPasswordAction,
  verifyForgotPasswordCodeAction,
  logoutAction,
  skipVerificationAction,
  twoStepVerificationAction,
  resendVerificationEmailAction,
  resendTwoStepCodeAction,
} from "../actions"
import { redirect } from "next/navigation"
import { authService } from "../services"
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from "@/lib/rate-limit"

const mockLogin = vi.mocked(authService.login)
const mockRegister = vi.mocked(authService.register)
const mockResetPassword = vi.mocked(authService.resetPassword)
const mockForgotPassword = vi.mocked(authService.forgotPassword)
const mockVerifyForgotPasswordCode = vi.mocked(authService.verifyForgotPasswordCode)
const mockLogout = vi.mocked(authService.logout)
const mockResendVerificationEmail = vi.mocked(authService.resendVerificationEmail)
const mockVerifyTwoStep = vi.mocked(authService.verifyTwoStep)
const mockResendTwoStepCode = vi.mocked(authService.resendTwoStepCode)
const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockRecordFailedAttempt = vi.mocked(recordFailedAttempt)
const mockResetRateLimit = vi.mocked(resetRateLimit)
const mockGetClientIp = vi.mocked(getClientIp)

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
      "login:user@example.com",
      expect.objectContaining({ max: 5 })
    )
    expect(mockResetRateLimit).not.toHaveBeenCalled()
  })

  it("resets the rate limit on a fully successful login", async () => {
    mockLogin.mockResolvedValue({ requiresTwoFactor: false, user: { id: "1" } as never })

    const result = await loginAction({}, formDataFor("user@example.com"))

    expect(result).toEqual({ success: true, user: { id: "1" } })
    expect(mockResetRateLimit).toHaveBeenCalledWith("login:user@example.com")
    expect(mockRecordFailedAttempt).not.toHaveBeenCalled()
  })

  it("resets the rate limit when login succeeds into the 2FA branch", async () => {
    mockLogin.mockResolvedValue({ requiresTwoFactor: true, twoFactorPhone: "+849xxxx" })

    await loginAction({}, formDataFor("user@example.com"))

    expect(mockResetRateLimit).toHaveBeenCalledWith("login:user@example.com")
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

    expect(mockCheckRateLimit).toHaveBeenCalledWith("login:user@example.com", expect.any(Object))
  })
})

describe("registerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 5, retryAfterMs: 0 })
  })

  function formDataForRegister(overrides: Partial<Record<string, string>> = {}) {
    const fd = new FormData()
    fd.set("username", overrides.username ?? "johndoe")
    fd.set("email", overrides.email ?? "user@example.com")
    fd.set("password", overrides.password ?? "password123")
    return fd
  }

  it("returns success (no server redirect) when registration succeeds, and counts the attempt", async () => {
    mockRegister.mockResolvedValue(undefined)

    const result = await registerAction({}, formDataForRegister())

    expect(result).toEqual({ success: true })
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      "register:user@example.com",
      expect.objectContaining({ max: 5 })
    )
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

  it("returns tooManyRequests and never calls authService.register when the rate limit denies", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 45_000 })

    const result = await registerAction({}, formDataForRegister())

    expect(result).toEqual({ error: "tooManyRequests", retryAfterMs: 45_000 })
    expect(mockRegister).not.toHaveBeenCalled()
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
    expect(mockResetRateLimit).toHaveBeenCalledWith("login:user@example.com")
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

    expect(mockResetRateLimit).toHaveBeenCalledWith("login:real-owner@example.com")
    expect(mockResetRateLimit).not.toHaveBeenCalledWith("login:victim@example.com")
  })

  it("returns resetPasswordFailed when authService.resetPassword rejects, and does not clear the rate limit", async () => {
    mockResetPassword.mockRejectedValue(new Error("invalid or expired token"))

    const result = await resetPasswordAction({}, formDataForReset())

    expect(result).toEqual({ error: "resetPasswordFailed" })
    expect(mockResetRateLimit).not.toHaveBeenCalled()
  })
})

describe("forgotPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 3, retryAfterMs: 0 })
  })

  function formDataForForgot(email = "user@example.com") {
    const fd = new FormData()
    fd.set("email", email)
    return fd
  }

  it("returns requiresEmailVerification on success and counts the attempt", async () => {
    mockForgotPassword.mockResolvedValue(undefined)

    const result = await forgotPasswordAction({}, formDataForForgot())

    expect(result).toEqual({ requiresEmailVerification: true })
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      "forgot-password:user@example.com",
      expect.objectContaining({ max: 3 })
    )
  })

  it("returns tooManyRequests and never calls authService when the rate limit denies", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 30_000 })

    const result = await forgotPasswordAction({}, formDataForForgot())

    expect(result).toEqual({ error: "tooManyRequests", retryAfterMs: 30_000 })
    expect(mockForgotPassword).not.toHaveBeenCalled()
  })

  it("returns forgotPasswordFailed when the schema rejects malformed input", async () => {
    const result = await forgotPasswordAction({}, formDataForForgot("not-an-email"))

    expect(result).toEqual({ error: "forgotPasswordFailed" })
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
  })

  it("returns forgotPasswordFailed when authService.forgotPassword rejects", async () => {
    mockForgotPassword.mockRejectedValue(new Error("email not found"))

    const result = await forgotPasswordAction({}, formDataForForgot())

    expect(result).toEqual({ error: "forgotPasswordFailed" })
  })
})

describe("verifyForgotPasswordCodeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 5, retryAfterMs: 0 })
  })

  function formDataForVerify(email = "user@example.com", code = "120820") {
    const fd = new FormData()
    fd.set("email", email)
    fd.set("code", code)
    return fd
  }

  it("returns the reset token and clears the rate limit on success", async () => {
    mockVerifyForgotPasswordCode.mockResolvedValue("reset-token-1")

    const result = await verifyForgotPasswordCodeAction({}, formDataForVerify())

    expect(result).toEqual({ success: true, resetToken: "reset-token-1" })
    expect(mockResetRateLimit).toHaveBeenCalledWith("verify-code:user@example.com")
  })

  it("records a failed attempt and returns invalidVerificationCode when the code is wrong", async () => {
    mockVerifyForgotPasswordCode.mockRejectedValue(new Error("invalid code"))

    const result = await verifyForgotPasswordCodeAction({}, formDataForVerify())

    expect(result).toEqual({ error: "invalidVerificationCode" })
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      "verify-code:user@example.com",
      expect.objectContaining({ max: 5 })
    )
    expect(mockResetRateLimit).not.toHaveBeenCalled()
  })

  it("returns invalidVerificationCode for a malformed code without touching the rate limit", async () => {
    const result = await verifyForgotPasswordCodeAction(
      {},
      formDataForVerify("user@example.com", "abc")
    )

    expect(result).toEqual({ error: "invalidVerificationCode" })
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
    expect(mockVerifyForgotPasswordCode).not.toHaveBeenCalled()
  })

  it("returns invalidVerificationCode for a malformed email without touching the rate limit (regression guard: email used to skip Zod validation entirely)", async () => {
    const result = await verifyForgotPasswordCodeAction(
      {},
      formDataForVerify("not-an-email", "120820")
    )

    expect(result).toEqual({ error: "invalidVerificationCode" })
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
    expect(mockVerifyForgotPasswordCode).not.toHaveBeenCalled()
  })

  it("returns tooManyRequests when the rate limit denies", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 15_000 })

    const result = await verifyForgotPasswordCodeAction({}, formDataForVerify())

    expect(result).toEqual({ error: "tooManyRequests", retryAfterMs: 15_000 })
    expect(mockVerifyForgotPasswordCode).not.toHaveBeenCalled()
  })
})

describe("logoutAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("logs out and redirects to the logout destination", async () => {
    mockLogout.mockResolvedValue(undefined)
    vi.mocked(authService.getLogoutRedirect).mockReturnValue("/login")

    await logoutAction()

    expect(mockLogout).toHaveBeenCalledOnce()
    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/vi/login")
  })
})

describe("skipVerificationAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("redirects to the dashboard without calling any auth service method", async () => {
    await skipVerificationAction()

    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/vi/dashboard")
    expect(mockLogout).not.toHaveBeenCalled()
  })
})

describe("twoStepVerificationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 5, retryAfterMs: 0 })
    mockGetClientIp.mockResolvedValue("203.0.113.5")
  })

  function formDataForTwoStep(code = "230320") {
    const fd = new FormData()
    fd.set("code", code)
    return fd
  }

  it("returns the user and clears the rate limit on success", async () => {
    mockVerifyTwoStep.mockResolvedValue({ id: "1" } as never)

    const result = await twoStepVerificationAction({}, formDataForTwoStep())

    expect(result).toEqual({ success: true, user: { id: "1" } })
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      "2fa:203.0.113.5",
      expect.objectContaining({ max: 5 })
    )
    expect(mockResetRateLimit).toHaveBeenCalledWith("2fa:203.0.113.5")
  })

  it("records a failed attempt keyed by client IP when the code is wrong", async () => {
    mockVerifyTwoStep.mockRejectedValue(new Error("invalid code"))

    const result = await twoStepVerificationAction({}, formDataForTwoStep())

    expect(result).toEqual({ error: "invalidVerificationCode" })
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      "2fa:203.0.113.5",
      expect.objectContaining({ max: 5 })
    )
  })

  it("returns invalidVerificationCode for a malformed code without calling getClientIp", async () => {
    const result = await twoStepVerificationAction({}, formDataForTwoStep("bad"))

    expect(result).toEqual({ error: "invalidVerificationCode" })
    expect(mockGetClientIp).not.toHaveBeenCalled()
  })

  it("returns tooManyRequests when the rate limit denies", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 20_000 })

    const result = await twoStepVerificationAction({}, formDataForTwoStep())

    expect(result).toEqual({ error: "tooManyRequests", retryAfterMs: 20_000 })
    expect(mockVerifyTwoStep).not.toHaveBeenCalled()
  })
})

describe("resendVerificationEmailAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 3, retryAfterMs: 0 })
  })

  function formDataForResend(email = "user@example.com") {
    const fd = new FormData()
    fd.set("email", email)
    return fd
  }

  it("returns success and counts the attempt", async () => {
    mockResendVerificationEmail.mockResolvedValue(undefined)

    const result = await resendVerificationEmailAction({}, formDataForResend())

    expect(result).toEqual({ success: true })
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      "resend-verify:user@example.com",
      expect.objectContaining({ max: 3 })
    )
  })

  it("returns resendFailed when there is no email in the form data", async () => {
    const fd = new FormData()

    const result = await resendVerificationEmailAction({}, fd)

    expect(result).toEqual({ error: "resendFailed" })
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
  })

  it("returns resendFailed for a malformed email without touching the rate limit (regression guard: email used to skip Zod validation entirely)", async () => {
    const result = await resendVerificationEmailAction({}, formDataForResend("not-an-email"))

    expect(result).toEqual({ error: "resendFailed" })
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
    expect(mockResendVerificationEmail).not.toHaveBeenCalled()
  })

  it("returns tooManyRequests when the rate limit denies", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 10_000 })

    const result = await resendVerificationEmailAction({}, formDataForResend())

    expect(result).toEqual({ error: "tooManyRequests", retryAfterMs: 10_000 })
    expect(mockResendVerificationEmail).not.toHaveBeenCalled()
  })

  it("returns resendFailed when authService.resendVerificationEmail rejects", async () => {
    mockResendVerificationEmail.mockRejectedValue(new Error("send failed"))

    const result = await resendVerificationEmailAction({}, formDataForResend())

    expect(result).toEqual({ error: "resendFailed" })
  })
})

describe("resendTwoStepCodeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 3, retryAfterMs: 0 })
    mockGetClientIp.mockResolvedValue("203.0.113.9")
  })

  it("returns success and counts the attempt keyed by client IP", async () => {
    mockResendTwoStepCode.mockResolvedValue(undefined)

    const result = await resendTwoStepCodeAction({}, new FormData())

    expect(result).toEqual({ success: true })
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      "2fa-resend:203.0.113.9",
      expect.objectContaining({ max: 3 })
    )
  })

  it("returns tooManyRequests when the rate limit denies, without calling the service", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 5_000 })

    const result = await resendTwoStepCodeAction({}, new FormData())

    expect(result).toEqual({ error: "tooManyRequests", retryAfterMs: 5_000 })
    expect(mockResendTwoStepCode).not.toHaveBeenCalled()
  })

  it("returns resendFailed when authService.resendTwoStepCode rejects", async () => {
    mockResendTwoStepCode.mockRejectedValue(new Error("send failed"))

    const result = await resendTwoStepCodeAction({}, new FormData())

    expect(result).toEqual({ error: "resendFailed" })
  })
})
