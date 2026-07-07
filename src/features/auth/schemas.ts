import { z } from "zod"

// Static schemas — used for type inference and server-side validation
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

// Factories for client-side forms — accept translated messages from useTranslations("validation")
export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(6, t("passwordMin")),
  })
}

export function createRegisterSchema(t: (key: string) => string) {
  return z
    .object({
      name: z.string().min(2, t("nameMin")),
      email: z.string().email(t("emailInvalid")),
      password: z.string().min(6, t("passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    })
}
