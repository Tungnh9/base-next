import { describe, it, expect } from "vitest"
import { authMockApi } from "../mock-data"

describe("authMockApi.login — role assignment", () => {
  it("logs in any regular email as role user", async () => {
    const { data } = await authMockApi.login({ email: "someone@example.com", password: "x" })

    expect(data?.user.role).toBe("user")
    expect(data?.requiresTwoFactor).toBe(false)
  })

  it("logs in admin@example.com as role admin — the only way to reach an admin-gated route while mocking", async () => {
    const { data } = await authMockApi.login({ email: "admin@example.com", password: "x" })

    expect(data?.user.role).toBe("admin")
    expect(data?.user.email).toBe("admin@example.com")
    expect(data?.requiresTwoFactor).toBe(false)
  })

  it("still triggers the 2FA branch for 2fa@example.com, as role user", async () => {
    const { data } = await authMockApi.login({ email: "2fa@example.com", password: "x" })

    expect(data?.requiresTwoFactor).toBe(true)
    expect(data?.user.role).toBe("user")
  })

  it("still fails for wrong@example.com regardless of the admin branch", async () => {
    const { data, error } = await authMockApi.login({ email: "wrong@example.com", password: "x" })

    expect(data).toBeNull()
    expect(error?.code).toBe("UNAUTHORIZED")
  })
})
