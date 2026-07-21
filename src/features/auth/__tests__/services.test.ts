import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyForgotPasswordCode: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    resendVerificationEmail: vi.fn(),
    verifyTwoStep: vi.fn(),
    resendTwoStepCode: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  setSession: vi.fn(),
  clearSession: vi.fn(),
  getSession: vi.fn(),
  verifyToken: vi.fn(),
}))

import { authService, AuthError } from "../services"
import { authApi } from "../api"
import { setSession, clearSession } from "@/lib/auth"

const mockLogin = vi.mocked(authApi.login)
const mockRegister = vi.mocked(authApi.register)
const mockForgotPassword = vi.mocked(authApi.forgotPassword)
const mockResetPassword = vi.mocked(authApi.resetPassword)
const mockVerifyForgotPasswordCode = vi.mocked(authApi.verifyForgotPasswordCode)
const mockVerifyTwoStep = vi.mocked(authApi.verifyTwoStep)
const mockSetSession = vi.mocked(setSession)
const mockClearSession = vi.mocked(clearSession)

// Minimal User fixture
const mockUser = {
  id: "user-1",
  email: "user@example.com",
  name: "Test User",
  role: "user" as const,
  createdAt: "2024-01-01T00:00:00.000Z",
}

// ─── authService.login ────────────────────────────────────────────────────────

describe("authService.login", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns requiresTwoFactor=false and sets session on success", async () => {
    mockLogin.mockResolvedValue({
      data: { token: "backend-access-token", user: mockUser, requiresTwoFactor: false },
      error: null,
    })

    const result = await authService.login({ email: "user@example.com", password: "pass123" })

    expect(result.requiresTwoFactor).toBe(false)
    expect(mockSetSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", email: "user@example.com" }),
      "backend-access-token"
    )
  })

  it("returns requiresTwoFactor=true and skips session cookie", async () => {
    mockLogin.mockResolvedValue({
      data: {
        token: "backend-token",
        user: mockUser,
        requiresTwoFactor: true,
        twoFactorPhone: "+84912345678",
      },
      error: null,
    })

    const result = await authService.login({ email: "user@example.com", password: "pass123" })

    expect(result.requiresTwoFactor).toBe(true)
    expect(result.twoFactorPhone).toBe("+84912345678")
    expect(mockSetSession).not.toHaveBeenCalled()
  })

  it("throws AuthError when API returns an error", async () => {
    mockLogin.mockResolvedValue({
      data: null,
      error: { message: "Invalid credentials", code: "UNAUTHORIZED", status: 401 },
    })

    await expect(
      authService.login({ email: "user@example.com", password: "wrong" })
    ).rejects.toThrow(AuthError)
  })

  it("throws AuthError when response has no user", async () => {
    // data exists but user is null/undefined — malformed response
    mockLogin.mockResolvedValue({ data: null, error: null })

    await expect(
      authService.login({ email: "user@example.com", password: "pass" })
    ).rejects.toThrow(AuthError)
  })
})

// ─── authService.register ─────────────────────────────────────────────────────

describe("authService.register", () => {
  beforeEach(() => vi.clearAllMocks())

  it("signs token and sets session cookie on success", async () => {
    mockRegister.mockResolvedValue({
      data: { token: "access-token", user: mockUser },
      error: null,
    })

    await authService.register({
      username: "johndoe",
      email: "user@example.com",
      password: "pass123",
    })

    expect(mockSetSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", email: "user@example.com" }),
      "access-token"
    )
  })

  it("throws AuthError on API error", async () => {
    mockRegister.mockResolvedValue({
      data: null,
      error: { message: "Email already taken", code: "CONFLICT", status: 409 },
    })

    await expect(
      authService.register({ username: "johndoe", email: "taken@example.com", password: "pass123" })
    ).rejects.toThrow(AuthError)
  })
})

// ─── authService.forgotPassword ──────────────────────────────────────────────

describe("authService.forgotPassword", () => {
  beforeEach(() => vi.clearAllMocks())

  it("resolves without error on success", async () => {
    mockForgotPassword.mockResolvedValue({ data: undefined, error: null })

    await expect(authService.forgotPassword("user@example.com")).resolves.toBeUndefined()
  })

  it("throws AuthError on API error", async () => {
    mockForgotPassword.mockResolvedValue({
      data: null,
      error: { message: "Email not found", code: "NOT_FOUND", status: 404 },
    })

    await expect(authService.forgotPassword("notfound@example.com")).rejects.toThrow(AuthError)
  })
})

// ─── authService.resetPassword ───────────────────────────────────────────────

describe("authService.resetPassword", () => {
  beforeEach(() => vi.clearAllMocks())

  it("resolves with the server-verified email on success", async () => {
    mockResetPassword.mockResolvedValue({ data: { email: "user@example.com" }, error: null })

    await expect(
      authService.resetPassword({ password: "newpass123", token: "valid-token" })
    ).resolves.toBe("user@example.com")
  })

  it("throws AuthError when the response is missing the email", async () => {
    mockResetPassword.mockResolvedValue({ data: {} as never, error: null })

    await expect(
      authService.resetPassword({ password: "newpass123", token: "valid-token" })
    ).rejects.toThrow(AuthError)
  })

  it("throws AuthError on API error", async () => {
    mockResetPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid or expired token", code: "INVALID_TOKEN", status: 400 },
    })

    await expect(
      authService.resetPassword({ password: "newpass123", token: "expired-token" })
    ).rejects.toThrow(AuthError)
  })
})

// ─── authService.verifyForgotPasswordCode ────────────────────────────────────

describe("authService.verifyForgotPasswordCode", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns the reset token on success", async () => {
    mockVerifyForgotPasswordCode.mockResolvedValue({
      data: { resetToken: "real-reset-token" },
      error: null,
    })

    const token = await authService.verifyForgotPasswordCode({
      email: "user@example.com",
      code: "120820",
    })

    expect(token).toBe("real-reset-token")
  })

  it("throws AuthError when the code is rejected", async () => {
    mockVerifyForgotPasswordCode.mockResolvedValue({
      data: null,
      error: { message: "Invalid verification code", code: "INVALID_CODE", status: 400 },
    })

    await expect(
      authService.verifyForgotPasswordCode({ email: "user@example.com", code: "000000" })
    ).rejects.toThrow(AuthError)
  })
})

// ─── authService.verifyTwoStep ────────────────────────────────────────────────

describe("authService.verifyTwoStep", () => {
  beforeEach(() => vi.clearAllMocks())

  it("signs a new session token and sets the cookie on success", async () => {
    mockVerifyTwoStep.mockResolvedValue({
      data: { token: "backend-access-token", user: mockUser },
      error: null,
    })

    const user = await authService.verifyTwoStep("230320")

    expect(user).toEqual(mockUser)
    expect(mockSetSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", email: "user@example.com" }),
      "backend-access-token"
    )
  })

  it("throws AuthError when the code is rejected", async () => {
    mockVerifyTwoStep.mockResolvedValue({
      data: null,
      error: { message: "Invalid verification code", code: "INVALID_CODE", status: 400 },
    })

    await expect(authService.verifyTwoStep("000000")).rejects.toThrow(AuthError)
    expect(mockSetSession).not.toHaveBeenCalled()
  })
})

// ─── authService.logout ──────────────────────────────────────────────────────

describe("authService.logout", () => {
  it("clears session cookie", async () => {
    mockClearSession.mockResolvedValue(undefined)

    await authService.logout()

    expect(mockClearSession).toHaveBeenCalledOnce()
  })
})
