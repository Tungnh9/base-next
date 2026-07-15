import { describe, it, expect } from "vitest"
import { createCustomerSchema, updateCustomerSchema } from "../schemas"

describe("createCustomerSchema", () => {
  const valid = {
    name: "Nguyễn Văn A",
    email: "a@example.com",
    phone: "0901234567",
    company: "ABC Corp",
    status: "active" as const,
  }

  it("accepts valid input", () => {
    expect(createCustomerSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects short name", () => {
    expect(createCustomerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false)
  })

  it("rejects invalid email", () => {
    expect(createCustomerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false)
  })

  it("rejects invalid status", () => {
    expect(createCustomerSchema.safeParse({ ...valid, status: "unknown" }).success).toBe(false)
  })

  it("rejects empty company", () => {
    expect(createCustomerSchema.safeParse({ ...valid, company: "" }).success).toBe(false)
  })
})

describe("updateCustomerSchema", () => {
  it("allows partial updates", () => {
    expect(updateCustomerSchema.safeParse({ name: "New Name" }).success).toBe(true)
  })

  it("allows empty object", () => {
    expect(updateCustomerSchema.safeParse({}).success).toBe(true)
  })

  it("still validates email format when provided", () => {
    expect(updateCustomerSchema.safeParse({ email: "bad" }).success).toBe(false)
  })
})
