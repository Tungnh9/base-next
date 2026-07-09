import { signToken, setSessionCookie, clearSessionCookie } from "@/lib/auth"
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

    const token = await signToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      accessToken: data.token,
    })
    await setSessionCookie(token)

    return { requiresTwoFactor: false, user: data.user }
  },

  async register(credentials: RegisterInput): Promise<void> {
    const { data, error } = await authApi.register(credentials)

    if (error) throw new AuthError(error.message, "REGISTER_FAILED")
    if (!data?.user) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    const token = await signToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      accessToken: data.token,
    })
    await setSessionCookie(token)
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

  async resetPassword(data: { password: string; token: string }): Promise<void> {
    const { error } = await authApi.resetPassword(data)
    if (error) throw new AuthError(error.message, "RESET_PASSWORD_FAILED")
  },

  async verifyForgotPasswordCode(data: { email: string; code: string }): Promise<string> {
    const { data: result, error } = await authApi.verifyForgotPasswordCode(data)

    if (error) throw new AuthError(error.message, "VERIFY_CODE_FAILED")
    if (!result?.resetToken)
      throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    return result.resetToken
  },

  async logout(): Promise<void> {
    await clearSessionCookie()
  },

  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await authApi.resendVerificationEmail({ email })
    if (error) throw new AuthError(error.message, "RESEND_FAILED")
  },

  async verifyTwoStep(code: string): Promise<User> {
    const { data, error } = await authApi.verifyTwoStep({ code })

    if (error) throw new AuthError(error.message, "VERIFY_TWO_STEP_FAILED")
    if (!data?.user) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    const token = await signToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      accessToken: data.token,
    })
    await setSessionCookie(token)

    return data.user
  },

  async resendTwoStepCode(): Promise<void> {
    const { error } = await authApi.resendTwoStepCode()
    if (error) throw new AuthError(error.message, "RESEND_FAILED")
  },
}
