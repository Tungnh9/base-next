"use server"

import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ROUTES } from "@/lib/constants"
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit"
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  otpSchema,
} from "./schemas"
import { authService } from "./services"
import type { User } from "./types"

export type AuthErrorCode =
  | "loginFailed"
  | "invalidCredentials"
  | "tooManyAttempts"
  | "registerFailed"
  | "resetPasswordFailed"
  | "forgotPasswordFailed"
  | "resendFailed"
  | "invalidVerificationCode"

// Brute-force guard for loginAction — see src/lib/rate-limit.ts for the
// in-memory implementation and its known limitations.
const LOGIN_RATE_LIMIT = { windowMs: 15 * 60 * 1000, max: 5 }

export interface ActionState {
  error?: AuthErrorCode
  success?: boolean
  requiresTwoFactor?: boolean
  twoFactorPhone?: string
  requiresEmailVerification?: boolean
  resetToken?: string
  user?: User
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) return { error: "invalidCredentials" }

  const identifier = parsed.data.email.trim().toLowerCase()
  if (!checkRateLimit(identifier, LOGIN_RATE_LIMIT).allowed) {
    return { error: "tooManyAttempts" }
  }

  let result: { requiresTwoFactor: boolean; twoFactorPhone?: string; user?: User }
  try {
    result = await authService.login(parsed.data)
  } catch {
    recordFailedAttempt(identifier, LOGIN_RATE_LIMIT)
    return { error: "loginFailed" }
  }

  // Correct credentials — reset the counter whether this resolves immediately
  // or continues into 2FA, since both mean the password was right.
  resetRateLimit(identifier)

  if (result.requiresTwoFactor) {
    return { requiresTwoFactor: true, twoFactorPhone: result.twoFactorPhone }
  }

  return { success: true, user: result.user }
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { error: "registerFailed" }

  try {
    await authService.register(parsed.data)
  } catch {
    return { error: "registerFailed" }
  }

  const locale = await getLocale()
  redirect(`/${locale}${ROUTES.verifyEmail}?email=${encodeURIComponent(raw.email)}`)
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = { email: formData.get("email") as string }

  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) return { error: "forgotPasswordFailed" }

  try {
    await authService.forgotPassword(parsed.data.email)
  } catch {
    return { error: "forgotPasswordFailed" }
  }

  return { requiresEmailVerification: true }
}

export async function verifyForgotPasswordCodeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string
  const parsedCode = otpSchema.safeParse(formData.get("code"))
  if (!email || !parsedCode.success) return { error: "invalidVerificationCode" }

  let resetToken: string
  try {
    resetToken = await authService.verifyForgotPasswordCode({ email, code: parsedCode.data })
  } catch {
    return { error: "invalidVerificationCode" }
  }

  return { success: true, resetToken }
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = formData.get("token") as string
  const raw = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const parsed = resetPasswordSchema.safeParse(raw)
  if (!parsed.success) return { error: "resetPasswordFailed" }

  try {
    await authService.resetPassword({ password: parsed.data.password, token })
  } catch {
    return { error: "resetPasswordFailed" }
  }

  const locale = await getLocale()
  redirect(`/${locale}${ROUTES.login}`)
}

export async function logoutAction(): Promise<void> {
  const locale = await getLocale()
  await authService.logout()
  redirect(`/${locale}${authService.getLogoutRedirect()}`)
}

export async function skipVerificationAction(): Promise<void> {
  const locale = await getLocale()
  redirect(`/${locale}${ROUTES.dashboard}`)
}

export async function twoStepVerificationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = otpSchema.safeParse(formData.get("code"))
  if (!parsed.success) {
    return { error: "invalidVerificationCode" }
  }
  const code = parsed.data

  let user: User
  try {
    user = await authService.verifyTwoStep(code)
  } catch {
    return { error: "invalidVerificationCode" }
  }

  // Client-side navigation (not redirect()) so the caller can persist `user`
  // to localStorage first — same pattern as loginAction.
  return { success: true, user }
}

export async function resendVerificationEmailAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string
  if (!email) return { error: "resendFailed" }

  try {
    await authService.resendVerificationEmail(email)
  } catch {
    return { error: "resendFailed" }
  }

  return { success: true }
}

export async function resendTwoStepCodeAction(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  try {
    await authService.resendTwoStepCode()
  } catch {
    return { error: "resendFailed" }
  }

  return { success: true }
}
