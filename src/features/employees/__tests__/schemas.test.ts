import { describe, it, expect } from "vitest"
import { createEmployeeSchema, updateEmployeeSchema } from "../schemas"

describe("createEmployeeSchema", () => {
  const valid = {
    name: "Nguyễn Văn An",
    email: "a@example.com",
    phone: "0901234567",
    department: "engineering" as const,
    position: "Frontend Engineer",
    status: "active" as const,
  }

  it("accepts valid input", () => {
    expect(createEmployeeSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects short name", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, name: "A" }).success).toBe(false)
  })

  it("rejects invalid email", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false)
  })

  it("rejects an unknown department", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, department: "unknown" }).success).toBe(false)
  })

  it("rejects an unknown status", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, status: "unknown" }).success).toBe(false)
  })

  it("accepts the on-leave status", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, status: "on-leave" }).success).toBe(true)
  })

  it("rejects a short position", () => {
    expect(createEmployeeSchema.safeParse({ ...valid, position: "A" }).success).toBe(false)
  })
})

describe("updateEmployeeSchema", () => {
  it("allows partial updates", () => {
    expect(updateEmployeeSchema.safeParse({ name: "New Name" }).success).toBe(true)
  })

  it("allows an empty object", () => {
    expect(updateEmployeeSchema.safeParse({}).success).toBe(true)
  })

  it("still validates email format when provided", () => {
    expect(updateEmployeeSchema.safeParse({ email: "bad" }).success).toBe(false)
  })
})
