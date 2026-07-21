import { setSession, clearSession } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import { authApi } from "./api"
import type { LoginInput, RegisterInput } from "./schemas"
import type { User } from "./types"

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export const authService = {
  async login(
    credentials: LoginInput
  ): Promise<{ requiresTwoFactor: boolean; twoFactorPhone?: string; user?: User }> {
    const { data, error } = await authApi.login(credentials)

    if (error) throw new AuthError(error.message, "LOGIN_FAILED")
    if (!data?.user) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, twoFactorPhone: data.twoFactorPhone }
    }

    await setSession(
      { userId: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role },
      data.token
    )

    return { requiresTwoFactor: false, user: data.user }
  },

  async register(credentials: RegisterInput): Promise<void> {
    const { data, error } = await authApi.register(credentials)

    if (error) throw new AuthError(error.message, "REGISTER_FAILED")
    if (!data?.user) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    await setSession(
      { userId: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role },
      data.token
    )
  },

  getLoginRedirect(): string {
    return ROUTES.dashboard
  },

  getLogoutRedirect(): string {
    return ROUTES.login
  },

  async forgotPassword(email: string): Promise<void> {
    const { error } = await authApi.forgotPassword({ email })
    if (error) throw new AuthError(error.message, "FORGOT_PASSWORD_FAILED")
  },

  // Returns the email the token was issued for — verified server-side, never
  // the client's own claim — so callers can safely key security-sensitive
  // operations (like clearing a login lockout) off the real account owner.
  async resetPassword(data: { password: string; token: string }): Promise<string> {
    const { data: result, error } = await authApi.resetPassword(data)
    if (error) throw new AuthError(error.message, "RESET_PASSWORD_FAILED")
    if (!result?.email) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")
    return result.email
  },

  async verifyForgotPasswordCode(data: { email: string; code: string }): Promise<string> {
    const { data: result, error } = await authApi.verifyForgotPasswordCode(data)

    if (error) throw new AuthError(error.message, "VERIFY_CODE_FAILED")
    if (!result?.resetToken)
      throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    return result.resetToken
  },

  async logout(): Promise<void> {
    // Best-effort: notify backend to invalidate the access token.
    // Always clear the local cookies regardless of backend response.
    try {
      await authApi.logout()
    } catch {
      // ignore — local cookies must still be cleared
    }
    await clearSession()
  },

  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await authApi.resendVerificationEmail({ email })
    if (error) throw new AuthError(error.message, "RESEND_FAILED")
  },

  async verifyTwoStep(code: string): Promise<User> {
    const { data, error } = await authApi.verifyTwoStep({ code })

    if (error) throw new AuthError(error.message, "VERIFY_TWO_STEP_FAILED")
    if (!data?.user) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    await setSession(
      { userId: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role },
      data.token
    )

    return data.user
  },

  async resendTwoStepCode(): Promise<void> {
    const { error } = await authApi.resendTwoStepCode()
    if (error) throw new AuthError(error.message, "RESEND_FAILED")
  },
}
