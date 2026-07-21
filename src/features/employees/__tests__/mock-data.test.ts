import { describe, it, expect } from "vitest"
import { employeeMockApi } from "../mock-data"

describe("employeeMockApi.getAll — pagination", () => {
  it("defaults to page 1 with a page size of 10", async () => {
    const { data } = await employeeMockApi.getAll()

    expect(data?.page).toBe(1)
    expect(data?.pageSize).toBe(10)
    expect(data?.data).toHaveLength(10)
    expect(data?.total).toBe(24)
    expect(data?.totalPages).toBe(3)
  })

  it("returns the correct partial last page", async () => {
    const { data } = await employeeMockApi.getAll({ page: 3, pageSize: 10 })

    expect(data?.page).toBe(3)
    expect(data?.data).toHaveLength(4)
  })

  it("clamps an out-of-range page down to the last valid page", async () => {
    const { data } = await employeeMockApi.getAll({ page: 999, pageSize: 10 })

    expect(data?.page).toBe(3)
    expect(data?.data).toHaveLength(4)
  })

  it("clamps a page below 1 up to page 1", async () => {
    const { data } = await employeeMockApi.getAll({ page: 0, pageSize: 10 })

    expect(data?.page).toBe(1)
  })

  it("filters by name or email (case-insensitive) before paginating", async () => {
    const { data } = await employeeMockApi.getAll({ search: "EMPLOYEE1@" })

    expect(data?.total).toBe(1)
    expect(data?.data[0].email).toBe("employee1@example.com")
  })

  it("returns an empty page (not an error) when the search matches nothing", async () => {
    const { data, error } = await employeeMockApi.getAll({ search: "no-such-person" })

    expect(error).toBeNull()
    expect(data?.data).toEqual([])
    expect(data?.total).toBe(0)
    expect(data?.totalPages).toBe(1)
  })

  it("respects a custom pageSize", async () => {
    const { data } = await employeeMockApi.getAll({ pageSize: 5 })

    expect(data?.data).toHaveLength(5)
    expect(data?.totalPages).toBe(5)
  })
})

// mock-data.ts holds its fixture array at module scope (mutated in place,
// same as customerMockApi) — these tests run after the pagination block
// above and must not assert on dataset-wide totals, since `create()` here
// permanently adds a 25th row for the rest of this file's run.
describe("employeeMockApi — CRUD", () => {
  it("getById returns NOT_FOUND for an unknown id", async () => {
    const { data, error } = await employeeMockApi.getById("no-such-id")

    expect(data).toBeNull()
    expect(error?.code).toBe("NOT_FOUND")
  })

  it("create then getById round-trips the new employee", async () => {
    const { data: created } = await employeeMockApi.create({
      name: "Test Person",
      email: "test.person@example.com",
      phone: "0900000000",
      department: "engineering",
      position: "QA Engineer",
      status: "active",
    })

    expect(created).not.toBeNull()
    const { data: fetched } = await employeeMockApi.getById(created!.id)
    expect(fetched?.email).toBe("test.person@example.com")
  })

  it("update returns NOT_FOUND for an unknown id", async () => {
    const { error } = await employeeMockApi.update("no-such-id", { name: "X" })

    expect(error?.code).toBe("NOT_FOUND")
  })
})
