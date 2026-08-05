import { describe, it, expect } from "vitest"
import { settingsMockApi } from "../mock-data"

describe("settingsMockApi.getWorkflowConfig / saveWorkflowConfig", () => {
  it("getWorkflowConfig returns the seeded stages", async () => {
    const { data } = await settingsMockApi.getWorkflowConfig()
    expect(data?.length).toBeGreaterThan(0)
  })

  it("saveWorkflowConfig persists the new stages so a later getWorkflowConfig sees them", async () => {
    const newStages = [
      {
        id: "stage-test-only",
        key: "salesOpportunities" as const,
        order: 1,
        enabled: true,
        states: [{ id: "s1", name: "State 1", color: "primary" as const }],
        actions: [{ id: "a1", label: "Action 1", type: "primary" as const, targetStateId: "s1" }],
      },
    ]

    await settingsMockApi.saveWorkflowConfig(newStages)
    const { data } = await settingsMockApi.getWorkflowConfig()

    expect(data).toEqual(newStages)
  })
})

describe("settingsMockApi.getUserPermissionsData / addUser / removeUser", () => {
  it("addUser then getUserPermissionsData round-trips the new user", async () => {
    const { data: created, error } = await settingsMockApi.addUser({
      name: "Round Trip User",
      email: "roundtrip@example.com",
      roleId: "role-staff",
    })

    expect(error).toBeNull()
    expect(created?.status).toBe("active")

    const { data } = await settingsMockApi.getUserPermissionsData()
    expect(data?.users.some((u) => u.id === created?.id)).toBe(true)
  })

  it("addUser returns NOT_FOUND for a roleId that does not exist", async () => {
    const { data, error } = await settingsMockApi.addUser({
      name: "Bad Role User",
      email: "badrole@example.com",
      roleId: "role-does-not-exist",
    })

    expect(data).toBeNull()
    expect(error?.code).toBe("NOT_FOUND")
  })

  it("removeUser removes a previously added user", async () => {
    const { data: created } = await settingsMockApi.addUser({
      name: "To Be Removed",
      email: "removeme@example.com",
      roleId: "role-staff",
    })

    const { error } = await settingsMockApi.removeUser(created!.id)
    expect(error).toBeNull()

    const { data } = await settingsMockApi.getUserPermissionsData()
    expect(data?.users.some((u) => u.id === created?.id)).toBe(false)
  })

  it("removeUser returns NOT_FOUND for an unknown id", async () => {
    const { error } = await settingsMockApi.removeUser("no-such-user")
    expect(error?.code).toBe("NOT_FOUND")
  })
})

describe("settingsMockApi.addRole / togglePermission", () => {
  it("addRole creates a role with every permission false", async () => {
    const { data } = await settingsMockApi.addRole("Test Role")

    expect(data?.name).toBe("Test Role")
    expect(data?.permissions.customers).toEqual({
      view: false,
      create: false,
      edit: false,
      delete: false,
    })
  })

  it("togglePermission flips exactly the targeted module/action, leaving siblings untouched", async () => {
    const { data: role } = await settingsMockApi.addRole("Toggle Test Role")

    const { data: updated } = await settingsMockApi.togglePermission(role!.id, "customers", "view")

    expect(updated?.permissions.customers.view).toBe(true)
    expect(updated?.permissions.customers.create).toBe(false)
    expect(updated?.permissions.employees.view).toBe(false)
  })

  it("togglePermission is idempotent-reversible: toggling twice returns to the original value", async () => {
    const { data: role } = await settingsMockApi.addRole("Toggle Twice Role")

    await settingsMockApi.togglePermission(role!.id, "invoices", "edit")
    const { data: revertedRole } = await settingsMockApi.togglePermission(
      role!.id,
      "invoices",
      "edit"
    )

    expect(revertedRole?.permissions.invoices.edit).toBe(false)
  })

  it("togglePermission returns NOT_FOUND for an unknown roleId", async () => {
    const { error } = await settingsMockApi.togglePermission("no-such-role", "customers", "view")
    expect(error?.code).toBe("NOT_FOUND")
  })

  it("does not mutate a shared permission object across roles (no cross-role bleed)", async () => {
    const { data: roleA } = await settingsMockApi.addRole("Role A")
    const { data: roleB } = await settingsMockApi.addRole("Role B")

    await settingsMockApi.togglePermission(roleA!.id, "customers", "delete")

    const { data } = await settingsMockApi.getUserPermissionsData()
    const freshRoleB = data?.roles.find((r) => r.id === roleB!.id)

    expect(freshRoleB?.permissions.customers.delete).toBe(false)
  })
})
