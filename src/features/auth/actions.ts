"use server"

import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ROUTES } from "@/lib/constants"
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from "@/lib/rate-limit"
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
  | "tooManyRequests"
  | "registerFailed"
  | "resetPasswordFailed"
  | "forgotPasswordFailed"
  | "resendFailed"
  | "invalidVerificationCode"

// Rate-limit guards — see src/lib/rate-limit.ts for the in-memory
// implementation and its known limitations. Two shapes:
//  - brute-force guards (login, code verification): count only failed
//    attempts, reset on success.
//  - spam/notification-cost guards (register, forgot-password, resend*):
//    count every attempt regardless of outcome, since even a "successful"
//    call sends a real email/SMS.
// Every key is prefixed with the action name (e.g. "login:") even when
// keyed by the same email — the underlying store is a single flat map, so
// without a prefix two actions for the same email would share one bucket:
// failing login 5x would also trip forgot-password's (lower) limit, and
// resetting one action's counter on success would silently reset another's.
const LOGIN_RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 }
const REGISTER_RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 }
const FORGOT_PASSWORD_RATE_LIMIT = { windowMs: 15 * 60 * 1000, max: 3 }
const VERIFY_CODE_RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 }
const RESEND_EMAIL_RATE_LIMIT = { windowMs: 15 * 60 * 1000, max: 3 }
const TWO_STEP_RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 }
const RESEND_TWO_STEP_RATE_LIMIT = { windowMs: 15 * 60 * 1000, max: 3 }

export interface ActionState {
  error?: AuthErrorCode
  success?: boolean
  requiresTwoFactor?: boolean
  twoFactorPhone?: string
  requiresEmailVerification?: boolean
  resetToken?: string
  user?: User
  retryAfterMs?: number
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

  const identifier = `login:${parsed.data.email.trim().toLowerCase()}`
  const rateLimitStatus = await checkRateLimit(identifier, LOGIN_RATE_LIMIT)
  if (!rateLimitStatus.allowed) {
    return { error: "tooManyAttempts", retryAfterMs: rateLimitStatus.retryAfterMs }
  }

  let result: { requiresTwoFactor: boolean; twoFactorPhone?: string; user?: User }
  try {
    result = await authService.login(parsed.data)
  } catch {
    await recordFailedAttempt(identifier, LOGIN_RATE_LIMIT)
    return { error: "loginFailed" }
  }

  // Correct credentials — reset the counter whether this resolves immediately
  // or continues into 2FA, since both mean the password was right.
  await resetRateLimit(identifier)

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

  const identifier = `register:${parsed.data.email.trim().toLowerCase()}`
  const rateLimitStatus = await checkRateLimit(identifier, REGISTER_RATE_LIMIT)
  if (!rateLimitStatus.allowed) {
    return { error: "tooManyRequests", retryAfterMs: rateLimitStatus.retryAfterMs }
  }
  await recordFailedAttempt(identifier, REGISTER_RATE_LIMIT)

  try {
    await authService.register(parsed.data)
  } catch {
    return { error: "registerFailed" }
  }

  // Client-side navigation (not redirect()) so the caller can show a success
  // toast before leaving the page — same pattern as loginAction.
  return { success: true }
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = { email: formData.get("email") as string }

  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) return { error: "forgotPasswordFailed" }

  const identifier = `forgot-password:${parsed.data.email.trim().toLowerCase()}`
  const rateLimitStatus = await checkRateLimit(identifier, FORGOT_PASSWORD_RATE_LIMIT)
  if (!rateLimitStatus.allowed) {
    return { error: "tooManyRequests", retryAfterMs: rateLimitStatus.retryAfterMs }
  }
  await recordFailedAttempt(identifier, FORGOT_PASSWORD_RATE_LIMIT)

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
  const parsedEmail = forgotPasswordSchema.shape.email.safeParse(formData.get("email"))
  const parsedCode = otpSchema.safeParse(formData.get("code"))
  if (!parsedEmail.success || !parsedCode.success) return { error: "invalidVerificationCode" }
  const email = parsedEmail.data

  const identifier = `verify-code:${email.trim().toLowerCase()}`
  const rateLimitStatus = await checkRateLimit(identifier, VERIFY_CODE_RATE_LIMIT)
  if (!rateLimitStatus.allowed) {
    return { error: "tooManyRequests", retryAfterMs: rateLimitStatus.retryAfterMs }
  }

  let resetToken: string
  try {
    resetToken = await authService.verifyForgotPasswordCode({ email, code: parsedCode.data })
  } catch {
    await recordFailedAttempt(identifier, VERIFY_CODE_RATE_LIMIT)
    return { error: "invalidVerificationCode" }
  }

  await resetRateLimit(identifier)
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

  let verifiedEmail: string
  try {
    verifiedEmail = await authService.resetPassword({ password: parsed.data.password, token })
  } catch {
    return { error: "resetPasswordFailed" }
  }

  // A successful password reset proves ownership of the account — clear any
  // login lockout for this email so the user isn't stuck waiting after
  // recovering access via forgot-password. Uses the email the server
  // resolved the token to, NOT client-submitted input — trusting the latter
  // would let anyone launder a victim's lockout reset through their own
  // valid token. Targets the "login:" bucket specifically — every
  // rate-limited action here has its own prefixed key so clearing one
  // can't accidentally reset another action's counter for the same email.
  await resetRateLimit(`login:${verifiedEmail.trim().toLowerCase()}`)

  // Client-side navigation (not redirect()) so the caller can show a success
  // toast before leaving the page — same pattern as loginAction.
  return { success: true }
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

  // No email/user identifier is available at this step (see authMockApi.verifyTwoStep) —
  // fall back to client IP as the brute-force guard key.
  const identifier = `2fa:${await getClientIp()}`
  const rateLimitStatus = await checkRateLimit(identifier, TWO_STEP_RATE_LIMIT)
  if (!rateLimitStatus.allowed) {
    return { error: "tooManyRequests", retryAfterMs: rateLimitStatus.retryAfterMs }
  }

  let user: User
  try {
    user = await authService.verifyTwoStep(code)
  } catch {
    await recordFailedAttempt(identifier, TWO_STEP_RATE_LIMIT)
    return { error: "invalidVerificationCode" }
  }

  await resetRateLimit(identifier)
  // Client-side navigation (not redirect()) so the caller can persist `user`
  // to localStorage first — same pattern as loginAction.
  return { success: true, user }
}

export async function resendVerificationEmailAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsedEmail = forgotPasswordSchema.shape.email.safeParse(formData.get("email"))
  if (!parsedEmail.success) return { error: "resendFailed" }
  const email = parsedEmail.data

  const identifier = `resend-verify:${email.trim().toLowerCase()}`
  const rateLimitStatus = await checkRateLimit(identifier, RESEND_EMAIL_RATE_LIMIT)
  if (!rateLimitStatus.allowed) {
    return { error: "tooManyRequests", retryAfterMs: rateLimitStatus.retryAfterMs }
  }
  await recordFailedAttempt(identifier, RESEND_EMAIL_RATE_LIMIT)

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
  const identifier = `2fa-resend:${await getClientIp()}`
  const rateLimitStatus = await checkRateLimit(identifier, RESEND_TWO_STEP_RATE_LIMIT)
  if (!rateLimitStatus.allowed) {
    return { error: "tooManyRequests", retryAfterMs: rateLimitStatus.retryAfterMs }
  }
  await recordFailedAttempt(identifier, RESEND_TWO_STEP_RATE_LIMIT)

  try {
    await authService.resendTwoStepCode()
  } catch {
    return { error: "resendFailed" }
  }

  return { success: true }
}
