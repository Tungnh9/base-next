import { describe, it, expect } from "vitest"
import { opportunityMockApi } from "../mock-data"

describe("opportunityMockApi.getAll — starts empty", () => {
  it("returns an empty page with totalPages 1 (not 0) when the dataset is empty", async () => {
    const { data, error } = await opportunityMockApi.getAll()

    expect(error).toBeNull()
    expect(data?.data).toEqual([])
    expect(data?.total).toBe(0)
    expect(data?.page).toBe(1)
    expect(data?.totalPages).toBe(1)
  })

  it("clamps an out-of-range page down to 1 on an empty dataset", async () => {
    const { data } = await opportunityMockApi.getAll({ page: 5 })

    expect(data?.page).toBe(1)
  })

  it("respects a custom pageSize on an empty dataset", async () => {
    const { data } = await opportunityMockApi.getAll({ pageSize: 5 })

    expect(data?.pageSize).toBe(5)
    expect(data?.data).toEqual([])
  })
})

describe("opportunityMockApi.getAll — filters are all no-ops on an empty dataset, but never error", () => {
  it("search filter", async () => {
    const { data, error } = await opportunityMockApi.getAll({ search: "deal" })
    expect(error).toBeNull()
    expect(data?.data).toEqual([])
  })

  it("customerId filter", async () => {
    const { data, error } = await opportunityMockApi.getAll({ customerId: "1" })
    expect(error).toBeNull()
    expect(data?.data).toEqual([])
  })

  it("salesRepId filter", async () => {
    const { data, error } = await opportunityMockApi.getAll({ salesRepId: "1" })
    expect(error).toBeNull()
    expect(data?.data).toEqual([])
  })

  it("status filter", async () => {
    const { data, error } = await opportunityMockApi.getAll({ status: "processing" })
    expect(error).toBeNull()
    expect(data?.data).toEqual([])
  })

  it("createdFrom/createdTo range filter", async () => {
    const { data, error } = await opportunityMockApi.getAll({
      createdFrom: "2024-01-01",
      createdTo: "2024-12-31",
    })
    expect(error).toBeNull()
    expect(data?.data).toEqual([])
  })
})

describe("opportunityMockApi.delete", () => {
  it("silently no-ops for an id that doesn't exist, without erroring", async () => {
    const { error } = await opportunityMockApi.delete("no-such-id")

    expect(error).toBeNull()
  })
})
