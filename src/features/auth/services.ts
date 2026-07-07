import { signToken, setSessionCookie, clearSessionCookie } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import { authApi } from "./api"
import type { LoginInput, RegisterInput } from "./schemas"

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
  async login(credentials: LoginInput): Promise<void> {
    const { data, error } = await authApi.login(credentials)

    if (error) throw new AuthError(error.message, "LOGIN_FAILED")
    if (!data?.user) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    const token = await signToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
    })
    await setSessionCookie(token)
  },

  async register(credentials: RegisterInput): Promise<void> {
    const { data, error } = await authApi.register(credentials)

    if (error) throw new AuthError(error.message, "REGISTER_FAILED")
    if (!data?.user) throw new AuthError("Unexpected response from server", "INVALID_RESPONSE")

    const token = await signToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
    })
    await setSessionCookie(token)
  },

  getLoginRedirect(): string {
    return ROUTES.dashboard
  },

  getLogoutRedirect(): string {
    return ROUTES.login
  },

  async logout(): Promise<void> {
    await clearSessionCookie()
  },
}
