import { describe, it, expect } from "vitest"
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  otpSchema,
  createLoginSchema,
  createRegisterSchema,
} from "../schemas"

// Mock t() for i18n factory schemas — returns key as value
const t = (key: string) => key

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("passes with valid email + password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "123456" })
    expect(result.success).toBe(true)
  })

  it("fails with invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe("email")
  })

  it("fails with password shorter than 6 chars", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "12345" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe("password")
  })

  it("fails with missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
  })
})

// ─── registerSchema ───────────────────────────────────────────────────────────

describe("registerSchema", () => {
  const valid = { username: "johndoe", email: "user@example.com", password: "123456" }

  it("passes with valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it("fails with username shorter than 2 chars", () => {
    const result = registerSchema.safeParse({ ...valid, username: "a" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe("username")
  })

  it("fails with invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "bad" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe("email")
  })

  it("fails with short password", () => {
    const result = registerSchema.safeParse({ ...valid, password: "123" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe("password")
  })
})

// ─── forgotPasswordSchema ─────────────────────────────────────────────────────

describe("forgotPasswordSchema", () => {
  it("passes with valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true)
  })

  it("fails with invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-email" }).success).toBe(false)
  })
})

// ─── resetPasswordSchema ──────────────────────────────────────────────────────

describe("resetPasswordSchema", () => {
  it("passes when passwords match and are long enough", () => {
    const result = resetPasswordSchema.safeParse({
      password: "newpass123",
      confirmPassword: "newpass123",
    })
    expect(result.success).toBe(true)
  })

  it("fails when passwords don't match", () => {
    const result = resetPasswordSchema.safeParse({
      password: "newpass123",
      confirmPassword: "different",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe("confirmPassword")
  })

  it("fails with password shorter than 6 chars", () => {
    const result = resetPasswordSchema.safeParse({ password: "123", confirmPassword: "123" })
    expect(result.success).toBe(false)
  })
})

// ─── otpSchema ────────────────────────────────────────────────────────────────

describe("otpSchema", () => {
  it("passes with exactly 6 digits", () => {
    expect(otpSchema.safeParse("123456").success).toBe(true)
    expect(otpSchema.safeParse("000000").success).toBe(true)
  })

  it("fails with fewer than 6 digits", () => {
    expect(otpSchema.safeParse("12345").success).toBe(false)
  })

  it("fails with more than 6 digits", () => {
    expect(otpSchema.safeParse("1234567").success).toBe(false)
  })

  it("fails with non-numeric characters", () => {
    expect(otpSchema.safeParse("12345a").success).toBe(false)
    expect(otpSchema.safeParse("abcdef").success).toBe(false)
  })

  it("fails with empty string", () => {
    expect(otpSchema.safeParse("").success).toBe(false)
  })
})

// ─── i18n factory: createLoginSchema ─────────────────────────────────────────

describe("createLoginSchema (i18n factory)", () => {
  const schema = createLoginSchema(t)

  it("uses custom error key for invalid email", () => {
    const result = schema.safeParse({ email: "bad", password: "123456" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("emailInvalid")
  })

  it("uses custom error key for short password", () => {
    const result = schema.safeParse({ email: "user@example.com", password: "123" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("passwordMin")
  })
})

// ─── i18n factory: createRegisterSchema ──────────────────────────────────────

describe("createRegisterSchema (i18n factory)", () => {
  const schema = createRegisterSchema(t)
  const valid = {
    username: "johndoe",
    email: "user@example.com",
    password: "123456",
    agreeToTerms: true,
  }

  it("passes with valid input and agreeToTerms=true", () => {
    expect(schema.safeParse(valid).success).toBe(true)
  })

  it("fails when agreeToTerms is false", () => {
    const result = schema.safeParse({ ...valid, agreeToTerms: false })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("mustAgreeTerms")
  })

  it("uses custom error key for short username", () => {
    const result = schema.safeParse({ ...valid, username: "a" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("usernameMin")
  })
})
