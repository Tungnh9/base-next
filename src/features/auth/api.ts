import { serverApi } from "@/lib/api"
import { USE_MOCK_API } from "@/lib/mock"
import { authMockApi } from "./mock-data"
import type {
  User,
  AuthResponse,
  VerifyForgotPasswordCodeResponse,
  ResetPasswordResponse,
} from "./types"
import type { LoginInput, RegisterInput } from "./schemas"

const authRealApi = {
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
    serverApi<ResetPasswordResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyForgotPasswordCode: (data: { email: string; code: string }) =>
    serverApi<VerifyForgotPasswordCodeResponse>("/auth/verify-forgot-password-code", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendVerificationEmail: (data: { email: string }) =>
    serverApi<void>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyTwoStep: (data: { code: string }) =>
    serverApi<AuthResponse>("/auth/verify-two-step", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendTwoStepCode: () => serverApi<void>("/auth/resend-two-step", { method: "POST" }),
}

// Single switch point — set NEXT_PUBLIC_USE_MOCK_API=false once the real backend exists.
export const authApi = USE_MOCK_API ? authMockApi : authRealApi
