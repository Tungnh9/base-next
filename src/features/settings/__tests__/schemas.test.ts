import { describe, it, expect } from "vitest"
import {
  addUserSchema,
  createAddUserSchema,
  togglePermissionSchema,
  workflowStagesSchema,
} from "../schemas"

describe("addUserSchema", () => {
  it("accepts a valid input", () => {
    const result = addUserSchema.safeParse({
      name: "Nguyễn Văn A",
      email: "a@example.com",
      roleId: "role-staff",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a name shorter than 2 characters", () => {
    expect(
      addUserSchema.safeParse({ name: "A", email: "a@example.com", roleId: "role-staff" }).success
    ).toBe(false)
  })

  it("rejects an invalid email", () => {
    expect(
      addUserSchema.safeParse({ name: "AB", email: "not-an-email", roleId: "role-staff" }).success
    ).toBe(false)
  })

  it("rejects an empty roleId", () => {
    expect(
      addUserSchema.safeParse({ name: "AB", email: "a@example.com", roleId: "" }).success
    ).toBe(false)
  })
})

describe("createAddUserSchema", () => {
  it("uses the translated messages passed in", () => {
    const t = (key: string) => `translated:${key}`
    const schema = createAddUserSchema(t)
    const result = schema.safeParse({ name: "A", email: "not-an-email", roleId: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("translated:nameMin")
      expect(messages).toContain("translated:emailInvalid")
      expect(messages).toContain("translated:roleRequired")
    }
  })
})

describe("togglePermissionSchema", () => {
  it("accepts a valid combination", () => {
    expect(
      togglePermissionSchema.safeParse({
        roleId: "role-staff",
        moduleKey: "customers",
        action: "view",
      }).success
    ).toBe(true)
  })

  it("rejects an unknown moduleKey", () => {
    expect(
      togglePermissionSchema.safeParse({
        roleId: "role-staff",
        moduleKey: "not-a-module",
        action: "view",
      }).success
    ).toBe(false)
  })

  it("rejects an unknown action", () => {
    expect(
      togglePermissionSchema.safeParse({
        roleId: "role-staff",
        moduleKey: "customers",
        action: "not-an-action",
      }).success
    ).toBe(false)
  })
})

function buildStage(overrides: { states?: unknown[]; actions?: unknown[] } = {}) {
  return {
    id: "stage-1",
    key: "salesOpportunities",
    order: 1,
    enabled: true,
    states: overrides.states ?? [{ id: "s1", name: "State 1", color: "primary" }],
    actions: overrides.actions ?? [
      { id: "a1", label: "Action 1", type: "primary", targetStateId: "s1" },
    ],
  }
}

describe("workflowStagesSchema", () => {
  it("accepts a valid stage where every action targets an existing state", () => {
    const result = workflowStagesSchema.safeParse([buildStage()])
    expect(result.success).toBe(true)
  })

  it("rejects an action whose targetStateId does not exist in the same stage (regression guard for the orphaned-state bug)", () => {
    const stage = buildStage({
      actions: [{ id: "a1", label: "Action 1", type: "primary", targetStateId: "does-not-exist" }],
    })
    const result = workflowStagesSchema.safeParse([stage])
    expect(result.success).toBe(false)
  })

  it("rejects a stage with an unknown color variant", () => {
    const stage = buildStage({
      states: [{ id: "s1", name: "State 1", color: "not-a-real-color" }],
    })
    expect(workflowStagesSchema.safeParse([stage]).success).toBe(false)
  })

  it("rejects a stage with zero states", () => {
    const stage = buildStage({ states: [] })
    expect(workflowStagesSchema.safeParse([stage]).success).toBe(false)
  })
})
