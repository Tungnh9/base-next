"use server"

import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ROUTES } from "@/lib/constants"
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "./schemas"
import { authService } from "./services"

export interface ActionState {
  error?: string
  success?: boolean
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

  try {
    await authService.login(parsed.data)
  } catch {
    return { error: "loginFailed" }
  }

  const locale = await getLocale()
  redirect(`/${locale}${authService.getLoginRedirect()}`)
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
  redirect(`/${locale}${authService.getLoginRedirect()}`)
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = { email: formData.get("email") as string }

  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) return { error: "invalidCredentials" }

  try {
    await authService.forgotPassword(parsed.data.email)
  } catch {
    return { error: "forgotPasswordFailed" }
  }

  return { success: true }
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
  const code = formData.get("code") as string

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { error: "invalidVerificationCode" }
  }

  const isDemoCode = process.env.NODE_ENV === "development" && code === "230320"
  if (!isDemoCode) {
    try {
      await authService.verifyTwoStep(code)
    } catch {
      return { error: "invalidVerificationCode" }
    }
  }

  const locale = await getLocale()
  redirect(`/${locale}${ROUTES.dashboard}`)
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
