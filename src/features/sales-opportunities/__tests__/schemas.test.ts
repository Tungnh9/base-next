import { describe, it, expect } from "vitest"
import { getOpportunitiesParamsSchema, opportunityIdSchema } from "../schemas"

describe("getOpportunitiesParamsSchema", () => {
  it("accepts an empty object (all params optional)", () => {
    expect(getOpportunitiesParamsSchema.safeParse({}).success).toBe(true)
  })

  it("accepts a full set of valid params", () => {
    expect(
      getOpportunitiesParamsSchema.safeParse({
        page: 2,
        pageSize: 20,
        search: "deal",
        customerId: "1",
        salesRepId: "2",
        status: "pending-approval",
        createdFrom: "2024-01-01",
        createdTo: "2024-12-31",
      }).success
    ).toBe(true)
  })

  it("rejects a page below 1", () => {
    expect(getOpportunitiesParamsSchema.safeParse({ page: 0 }).success).toBe(false)
  })

  it("rejects a pageSize above 100", () => {
    expect(getOpportunitiesParamsSchema.safeParse({ pageSize: 1000 }).success).toBe(false)
  })

  it("rejects an invalid status filter", () => {
    expect(getOpportunitiesParamsSchema.safeParse({ status: "unknown" }).success).toBe(false)
  })

  it("rejects a malformed createdFrom/createdTo date", () => {
    expect(getOpportunitiesParamsSchema.safeParse({ createdFrom: "not-a-date" }).success).toBe(
      false
    )
    expect(getOpportunitiesParamsSchema.safeParse({ createdTo: "2024-13-40" }).success).toBe(false)
  })
})

describe("opportunityIdSchema", () => {
  it("accepts a non-empty id", () => {
    expect(opportunityIdSchema.safeParse("1").success).toBe(true)
  })

  it("rejects an empty id", () => {
    expect(opportunityIdSchema.safeParse("").success).toBe(false)
  })
})
