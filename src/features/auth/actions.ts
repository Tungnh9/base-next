"use server"

import { redirect } from "next/navigation"
import { loginSchema, registerSchema } from "./schemas"
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

  redirect(authService.getLoginRedirect())
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { error: "registerFailed" }

  try {
    await authService.register(parsed.data)
  } catch {
    return { error: "registerFailed" }
  }

  redirect(authService.getLoginRedirect())
}

export async function logoutAction(): Promise<void> {
  await authService.logout()
  redirect(authService.getLogoutRedirect())
}
