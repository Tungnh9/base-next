import { serverApi } from "@/lib/api"
import type { User, AuthResponse } from "./types"
import type { LoginInput, RegisterInput } from "./schemas"

export const authApi = {
  login: (credentials: LoginInput) =>
    serverApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (credentials: RegisterInput) =>
    serverApi<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  me: () => serverApi<User>("/auth/me"),

  logout: () => serverApi<void>("/auth/logout", { method: "POST" }),

  forgotPassword: (data: { email: string }) =>
    serverApi<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data: { password: string; token: string }) =>
    serverApi<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendVerificationEmail: (data: { email: string }) =>
    serverApi<void>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyTwoStep: (data: { code: string }) =>
    serverApi<void>("/auth/verify-two-step", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendTwoStepCode: () => serverApi<void>("/auth/resend-two-step", { method: "POST" }),
}
