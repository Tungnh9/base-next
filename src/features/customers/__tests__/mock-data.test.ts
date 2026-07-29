import { describe, it, expect } from "vitest"
import { customerMockApi } from "../mock-data"

describe("customerMockApi.getAll — pagination", () => {
  it("defaults to page 1 with a page size of 10", async () => {
    const { data } = await customerMockApi.getAll()

    expect(data?.page).toBe(1)
    expect(data?.pageSize).toBe(10)
    expect(data?.data).toHaveLength(10)
    expect(data?.total).toBe(24)
    expect(data?.totalPages).toBe(3)
  })

  it("returns the correct partial last page", async () => {
    const { data } = await customerMockApi.getAll({ page: 3, pageSize: 10 })

    expect(data?.page).toBe(3)
    expect(data?.data).toHaveLength(4)
  })

  it("clamps an out-of-range page down to the last valid page", async () => {
    const { data } = await customerMockApi.getAll({ page: 999, pageSize: 10 })

    expect(data?.page).toBe(3)
    expect(data?.data).toHaveLength(4)
  })

  it("clamps a page below 1 up to page 1", async () => {
    const { data } = await customerMockApi.getAll({ page: 0, pageSize: 10 })

    expect(data?.page).toBe(1)
  })

  it("respects a custom pageSize", async () => {
    const { data } = await customerMockApi.getAll({ pageSize: 5 })

    expect(data?.data).toHaveLength(5)
    expect(data?.totalPages).toBe(5)
  })

  it("every fixture has a non-negative opportunityCount", async () => {
    const { data } = await customerMockApi.getAll({ pageSize: 100 })

    expect(
      data!.data.every((c) => Number.isInteger(c.opportunityCount) && c.opportunityCount >= 0)
    ).toBe(true)
  })
})

describe("customerMockApi.getAll — filtering", () => {
  it("filters by name, email, or phone (case-insensitive) before paginating", async () => {
    const { data } = await customerMockApi.getAll({ search: "CUSTOMER1@" })

    expect(data?.total).toBe(1)
    expect(data?.data[0].email).toBe("customer1@example.com")
  })

  it("matches search against phone number", async () => {
    const first = await customerMockApi.getAll({ pageSize: 1 })
    const phone = first.data!.data[0].phone

    const { data } = await customerMockApi.getAll({ search: phone })

    expect(data!.total).toBeGreaterThanOrEqual(1)
    expect(data!.data.some((c) => c.phone === phone)).toBe(true)
  })

  it("returns an empty page (not an error) when the search matches nothing", async () => {
    const { data, error } = await customerMockApi.getAll({ search: "no-such-person" })

    expect(error).toBeNull()
    expect(data?.data).toEqual([])
    expect(data?.total).toBe(0)
    expect(data?.totalPages).toBe(1)
  })

  it("matches search against the customer code", async () => {
    const first = await customerMockApi.getAll({ pageSize: 1 })
    const code = first.data!.data[0].code

    const { data } = await customerMockApi.getAll({ search: code })

    expect(data!.total).toBeGreaterThanOrEqual(1)
    expect(data!.data.some((c) => c.code === code)).toBe(true)
  })

  it("filters by classification", async () => {
    const { data } = await customerMockApi.getAll({ classification: "corporation", pageSize: 100 })

    expect(data!.total).toBeGreaterThan(0)
    expect(data!.data.every((c) => c.classification === "corporation")).toBe(true)
  })

  it("filters by industry", async () => {
    const { data } = await customerMockApi.getAll({ industry: "ecommerce", pageSize: 100 })

    expect(data!.total).toBeGreaterThan(0)
    expect(data!.data.every((c) => c.industry === "ecommerce")).toBe(true)
  })

  it("filters by status", async () => {
    const { data } = await customerMockApi.getAll({ status: "paused", pageSize: 100 })

    expect(data!.total).toBeGreaterThan(0)
    expect(data!.data.every((c) => c.status === "paused")).toBe(true)
  })

  it("combines multiple filters (AND, not OR)", async () => {
    const { data } = await customerMockApi.getAll({
      classification: "corporation",
      industry: "ecommerce",
      pageSize: 100,
    })

    expect(
      data!.data.every((c) => c.classification === "corporation" && c.industry === "ecommerce")
    ).toBe(true)
  })
})

// mock-data.ts holds its fixture array at module scope (mutated in place,
// same as employeeMockApi) — these tests run after the pagination/filter
// blocks above and must not assert on dataset-wide totals, since `create()`
// here permanently adds a 25th row for the rest of this file's run.
describe("customerMockApi — CRUD", () => {
  it("getById returns NOT_FOUND for an unknown id", async () => {
    const { data, error } = await customerMockApi.getById("no-such-id")

    expect(data).toBeNull()
    expect(error?.code).toBe("NOT_FOUND")
  })

  it("create then getById round-trips the new customer", async () => {
    const { data: created } = await customerMockApi.create({
      name: "Test Customer",
      email: "test.customer@example.com",
      phone: "0900000000",
      company: "Test Co",
      shortName: "TestCo",
      taxCode: "1111111111",
      salesRepId: "1",
      contractManagerId: "2",
      classification: "partner",
      industry: "telecom-it",
      status: "potential",
    })

    expect(created).not.toBeNull()
    const { data: fetched } = await customerMockApi.getById(created!.id)
    expect(fetched?.email).toBe("test.customer@example.com")
  })

  it("create assigns a code matching the classification+industry+shortName-initial convention", async () => {
    const { data: created } = await customerMockApi.create({
      name: "Another Customer",
      email: "another.customer@example.com",
      phone: "0900000001",
      company: "Another Co",
      shortName: "Zenith",
      taxCode: "2222222222",
      salesRepId: "1",
      contractManagerId: "2",
      classification: "partner", // Đại lý -> "3"
      industry: "ecommerce", // "TMDT"
      status: "potential",
    })

    expect(created?.code).toMatch(/^3TMDT-Z\d{5}$/)
  })

  it("create ignores a code in the input — it is always derived, never taken from the caller", async () => {
    const { data: created } = await customerMockApi.create({
      name: "Spoofed Code Customer",
      email: "spoofed.code@example.com",
      phone: "0900000003",
      company: "Spoofed Co",
      shortName: "Spoofed",
      taxCode: "3333333333",
      salesRepId: "1",
      contractManagerId: "2",
      // `code` isn't part of CreateCustomerInput, so this cast is the only
      // way to simulate a hostile/malformed direct call still reaching here.
      ...({ code: "9ZZ-Z99999" } as object),
      classification: "partner",
      industry: "telecom-it",
      status: "potential",
    })

    expect(created?.code).not.toBe("9ZZ-Z99999")
  })

  it("counts sequence numbers independently per classification+industry+initial combination", async () => {
    const makeInput = (email: string) => ({
      name: "Sequence Customer",
      email,
      phone: "0900000010",
      company: "Sequence Co",
      shortName: "Unique",
      taxCode: "4444444444",
      salesRepId: "1",
      contractManagerId: "2",
      classification: "technology" as const, // Công ty -> "2"
      industry: "finance-banking" as const, // "TC"
      status: "potential" as const,
    })

    const first = await customerMockApi.create(makeInput("sequence1@example.com"))
    const second = await customerMockApi.create(makeInput("sequence2@example.com"))

    expect(first.data?.code).toMatch(/^2TC-U\d{5}$/)
    expect(second.data?.code).toMatch(/^2TC-U\d{5}$/)
    const firstSeq = Number(first.data!.code.slice(-5))
    const secondSeq = Number(second.data!.code.slice(-5))
    expect(secondSeq).toBe(firstSeq + 1)
  })

  it("create starts a new customer at zero opportunities", async () => {
    const { data: created } = await customerMockApi.create({
      name: "Zero Opportunity Customer",
      email: "zero.opportunity@example.com",
      phone: "0900000002",
      company: "Zero Co",
      shortName: "ZeroCo",
      taxCode: "5555555555",
      salesRepId: "1",
      contractManagerId: "2",
      classification: "partner",
      industry: "telecom-it",
      status: "potential",
    })

    expect(created?.opportunityCount).toBe(0)
  })

  it("update returns NOT_FOUND for an unknown id", async () => {
    const { error } = await customerMockApi.update("no-such-id", { name: "X" })

    expect(error?.code).toBe("NOT_FOUND")
  })
})
