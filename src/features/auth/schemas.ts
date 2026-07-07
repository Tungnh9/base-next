import { z } from "zod"

// Static schemas — used for type inference and server-side validation
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export type RegisterFormInput = {
  username: string
  email: string
  password: string
  agreeToTerms: boolean
}

// Factories for client-side forms — accept translated messages from useTranslations("validation")
export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(6, t("passwordMin")),
  })
}

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function createForgotPasswordSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("emailInvalid")),
  })
}

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  })

export type ResetPasswordInput = { password: string; token: string }

export function createResetPasswordSchema(t: (key: string) => string) {
  return z
    .object({
      password: z.string().min(6, t("passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    })
}

export type ResetPasswordFormInput = {
  password: string
  confirmPassword: string
}

export function createRegisterSchema(t: (key: string) => string) {
  return z.object({
    username: z.string().min(2, t("usernameMin")),
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(6, t("passwordMin")),
    agreeToTerms: z.boolean().refine((val) => val === true, { message: t("mustAgreeTerms") }),
  })
}
