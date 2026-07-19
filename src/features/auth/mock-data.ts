import { mockApi, mockApiError } from "@/lib/mock"
import type {
  AuthResponse,
  User,
  VerifyForgotPasswordCodeResponse,
  ResetPasswordResponse,
} from "./types"
import type { LoginInput, RegisterInput } from "./schemas"

const MOCK_USER: User = {
  id: "mock-user-1",
  email: "duyen@gmail.com",
  name: "Duyên Nguyễn",
  role: "user",
  createdAt: "2026-01-01T00:00:00.000Z",
}

// Fixed test cases so every auth branch (success / 2FA / failure) is reachable
// deterministically while mocking — any other email/password just succeeds.
const MOCK_2FA_EMAIL = "2fa@example.com"
const MOCK_FAIL_EMAIL = "wrong@example.com"
// The only way to reach an admin-gated route (e.g. /employees) while mocking —
// every other email logs in as role "user".
const MOCK_ADMIN_EMAIL = "admin@example.com"
const MOCK_2FA_CODE = "230320"
const MOCK_FORGOT_PASSWORD_CODE = "120820"
const MOCK_RESET_TOKEN = "demo-reset-token"

// Simulates a real backend binding a reset token to the account that
// requested it. resetPassword() must resolve the email from this map — never
// from client-submitted input — so a caller can't launder an unrelated
// email's rate-limit reset through their own valid token.
const resetTokenOwner = new Map<string, string>()

export const authMockApi = {
  login: ({ email }: LoginInput) => {
    if (email === MOCK_FAIL_EMAIL) {
      return mockApiError({
        message: "Invalid email or password",
        code: "UNAUTHORIZED",
        status: 401,
      })
    }
    if (email === MOCK_2FA_EMAIL) {
      return mockApi<AuthResponse>({
        token: "mock-access-token",
        user: { ...MOCK_USER, email },
        requiresTwoFactor: true,
        twoFactorPhone: "+84900000000",
      })
    }
    if (email === MOCK_ADMIN_EMAIL) {
      return mockApi<AuthResponse>({
        token: "mock-access-token",
        user: { ...MOCK_USER, email, role: "admin" },
        requiresTwoFactor: false,
      })
    }
    return mockApi<AuthResponse>({
      token: "mock-access-token",
      user: { ...MOCK_USER, email },
      requiresTwoFactor: false,
    })
  },

  register: ({ email, username }: RegisterInput) =>
    mockApi<AuthResponse>({
      token: "mock-access-token",
      user: { ...MOCK_USER, email, name: username },
      requiresTwoFactor: false,
    }),

  me: () => mockApi<User>(MOCK_USER),

  logout: () => mockApi<void>(undefined),

  forgotPassword: (_data: { email: string }) => mockApi<void>(undefined),

  resetPassword: (data: { password: string; token: string }) => {
    const ownerEmail = resetTokenOwner.get(data.token)
    if (data.token !== MOCK_RESET_TOKEN || !ownerEmail) {
      return mockApiError({
        message: "Invalid or expired token",
        code: "INVALID_TOKEN",
        status: 400,
      })
    }
    resetTokenOwner.delete(data.token) // one-time use
    return mockApi<ResetPasswordResponse>({ email: ownerEmail })
  },

  verifyForgotPasswordCode: (data: { email: string; code: string }) => {
    if (data.code !== MOCK_FORGOT_PASSWORD_CODE) {
      return mockApiError({
        message: "Invalid verification code",
        code: "INVALID_CODE",
        status: 400,
      })
    }
    resetTokenOwner.set(MOCK_RESET_TOKEN, data.email)
    return mockApi<VerifyForgotPasswordCodeResponse>({ resetToken: MOCK_RESET_TOKEN })
  },

  resendVerificationEmail: (_data: { email: string }) => mockApi<void>(undefined),

  verifyTwoStep: (data: { code: string }) =>
    data.code === MOCK_2FA_CODE
      ? mockApi<AuthResponse>({
          token: "mock-access-token",
          user: { ...MOCK_USER, email: MOCK_2FA_EMAIL },
          requiresTwoFactor: false,
        })
      : mockApiError({ message: "Invalid verification code", code: "INVALID_CODE", status: 400 }),

  resendTwoStepCode: () => mockApi<void>(undefined),
}
