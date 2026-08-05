import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../../actions", () => ({
  getCustomers: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { useCustomers } from "../../hooks/use-customers"
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../../actions"
import { toast } from "sonner"
import type { Customer } from "../../types"

const mockGetCustomers = vi.mocked(getCustomers)
const mockCreateCustomer = vi.mocked(createCustomer)
const mockUpdateCustomer = vi.mocked(updateCustomer)
const mockDeleteCustomer = vi.mocked(deleteCustomer)
const mockToastError = vi.mocked(toast.error)
const mockToastSuccess = vi.mocked(toast.success)

const customerA: Customer = {
  id: "1",
  code: "KH00001",
  opportunityCount: 0,
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  company: "ABC",
  classification: "corporation",
  industry: "finance-banking",
  status: "collaborating",
  createdAt: "2024-01-01T00:00:00.000Z",
}
const customerB: Customer = {
  id: "2",
  code: "KH00002",
  opportunityCount: 0,
  name: "Lê Minh Châu",
  email: "chau@example.com",
  phone: "0923456789",
  company: "XYZ",
  classification: "technology",
  industry: "ecommerce",
  status: "paused",
  createdAt: "2024-02-01T00:00:00.000Z",
}

function pageOf(
  data: Customer[],
  overrides: Partial<{ total: number; totalPages: number; page: number }> = {}
) {
  return {
    data: {
      data,
      total: overrides.total ?? data.length,
      page: overrides.page ?? 1,
      pageSize: 10,
      totalPages: overrides.totalPages ?? 1,
    },
    error: null,
  }
}

describe("useCustomers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCustomers.mockResolvedValue(pageOf([customerA, customerB]))
  })

  it("starts with isLoading=true, then loads customers from getCustomers on mount", async () => {
    const { result } = renderHook(() => useCustomers())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.customers).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.customers).toEqual([customerA, customerB])
    expect(mockGetCustomers).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      search: "",
      classification: undefined,
      industry: undefined,
      status: undefined,
    })
  })

  it("toasts an error and stops loading when getCustomers resolves with an error", async () => {
    mockGetCustomers.mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.customers).toEqual([])
    expect(mockToastError).toHaveBeenCalledWith("boom")
  })

  it("setPage refetches with the new page number", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Echo the requested page back (as a real, non-clamping response would)
    // so the page-sync guard in the effect has nothing to correct here.
    mockGetCustomers.mockImplementation(async ({ page: requestedPage = 1 } = {}) =>
      pageOf([customerA, customerB], { page: requestedPage })
    )

    act(() => result.current.setPage(2))
    await waitFor(() => expect(mockGetCustomers).toHaveBeenCalledTimes(2))

    expect(mockGetCustomers).toHaveBeenLastCalledWith({
      page: 2,
      pageSize: 10,
      search: "",
      classification: undefined,
      industry: undefined,
      status: undefined,
    })
  })

  it("setSearch resets back to page 1", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPage(3))
    await waitFor(() => expect(result.current.page).toBe(3))

    act(() => result.current.setSearch("an"))

    expect(result.current.page).toBe(1)
    await waitFor(() =>
      expect(mockGetCustomers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        search: "an",
        classification: undefined,
        industry: undefined,
        status: undefined,
      })
    )
  })

  it("setClassification resets back to page 1 and refetches with the filter", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPage(2))
    await waitFor(() => expect(result.current.page).toBe(2))

    act(() => result.current.setClassification("partner"))

    expect(result.current.page).toBe(1)
    await waitFor(() =>
      expect(mockGetCustomers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        search: "",
        classification: "partner",
        industry: undefined,
        status: undefined,
      })
    )
  })

  it("setIndustry resets back to page 1 and refetches with the filter", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setIndustry("telecom-it"))

    await waitFor(() =>
      expect(mockGetCustomers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        search: "",
        classification: undefined,
        industry: "telecom-it",
        status: undefined,
      })
    )
  })

  it("setStatus resets back to page 1 and refetches with the filter", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setStatus("potential"))

    await waitFor(() =>
      expect(mockGetCustomers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        search: "",
        classification: undefined,
        industry: undefined,
        status: "potential",
      })
    )
  })

  it("refresh() sets isLoading and refetches with the same page/filters", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.refresh())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetCustomers).toHaveBeenCalledTimes(2)
  })

  it("handleCreate refetches and returns true on success", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockCreateCustomer.mockResolvedValue({
      data: { ...customerA, id: "3", name: "New Customer" },
      error: null,
    })

    let ok = false
    await act(async () => {
      ok = await result.current.handleCreate({
        name: "New Customer",
        email: "new@example.com",
        phone: "0900000000",
        company: "ABC",
        shortName: "ABC",
        taxCode: "0123456789",
        salesRepId: "1",
        contractManagerId: "2",
        classification: "corporation",
        industry: "finance-banking",
        status: "collaborating",
      })
    })

    expect(ok).toBe(true)
    expect(mockGetCustomers).toHaveBeenCalledTimes(2) // initial load + refresh after create
    expect(mockToastSuccess).toHaveBeenCalledWith("createSuccess")
  })

  it("handleCreate toasts the error and returns false without refetching on failure", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockCreateCustomer.mockResolvedValue({
      data: null,
      error: { message: "invalid", code: "VALIDATION_ERROR", status: 400 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.handleCreate({
        name: "",
        email: "",
        phone: "",
        company: "",
        shortName: "",
        taxCode: "",
        salesRepId: "",
        contractManagerId: "",
        classification: "corporation",
        industry: "finance-banking",
        status: "collaborating",
      })
    })

    expect(ok).toBe(false)
    expect(mockGetCustomers).toHaveBeenCalledTimes(1) // no refresh on failure
    expect(mockToastError).toHaveBeenCalledWith("invalid")
  })

  it("handleUpdate replaces the matching customer in place without refetching", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const updated: Customer = { ...customerA, name: "Updated Name" }
    mockUpdateCustomer.mockResolvedValue({ data: updated, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleUpdate("1", { name: "Updated Name" })
    })

    expect(ok).toBe(true)
    expect(result.current.customers.find((c) => c.id === "1")).toEqual(updated)
    expect(mockGetCustomers).toHaveBeenCalledTimes(1) // in-place update, no refresh
  })

  it("handleUpdate returns false and leaves customers unchanged on error", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const before = result.current.customers

    mockUpdateCustomer.mockResolvedValue({
      data: null,
      error: { message: "failed", code: "SERVER_ERROR", status: 500 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.handleUpdate("1", { name: "x" })
    })

    expect(ok).toBe(false)
    expect(result.current.customers).toEqual(before)
  })

  it("handleDelete refetches and returns true on success", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteCustomer.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDelete("1")
    })

    expect(ok).toBe(true)
    expect(mockGetCustomers).toHaveBeenCalledTimes(2)
    expect(mockToastSuccess).toHaveBeenCalledWith("deleteSuccess")
  })

  it("syncs page down to the server-clamped page after deleting the last row of the last page (regression guard)", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Move to the last page (3 of 3), echoing the requested page back
    // normally — nothing to clamp yet.
    mockGetCustomers.mockImplementation(async ({ page: requestedPage = 1 } = {}) => ({
      data: { data: [customerA], total: 21, page: requestedPage, pageSize: 10, totalPages: 3 },
      error: null,
    }))
    act(() => result.current.setPage(3))
    await waitFor(() => expect(result.current.page).toBe(3))
    await waitFor(() =>
      expect(mockGetCustomers).toHaveBeenLastCalledWith({
        page: 3,
        pageSize: 10,
        search: "",
        classification: undefined,
        industry: undefined,
        status: undefined,
      })
    )

    // Deleting the last row on page 3 makes the server clamp back to page 2
    // (mirrors mock-data.ts's own `Math.min(Math.max(1, page), totalPages)`) —
    // still requested as page 3 (stale local state) but the response says 2.
    mockDeleteCustomer.mockResolvedValue({ data: undefined, error: null })
    mockGetCustomers.mockResolvedValue({
      data: { data: [customerA, customerB], total: 20, page: 2, pageSize: 10, totalPages: 2 },
      error: null,
    })

    await act(async () => {
      await result.current.handleDelete("1")
    })

    await waitFor(() => expect(result.current.page).toBe(2))
    expect(mockGetCustomers).toHaveBeenLastCalledWith({
      page: 2,
      pageSize: 10,
      search: "",
      classification: undefined,
      industry: undefined,
      status: undefined,
    })
  })

  it("handleDelete returns false and does not refetch on error", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteCustomer.mockResolvedValue({
      data: null,
      error: { message: "failed", code: "SERVER_ERROR", status: 500 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.handleDelete("1")
    })

    expect(ok).toBe(false)
    expect(mockGetCustomers).toHaveBeenCalledTimes(1)
  })

  it("handleDeleteMany refetches once and toasts success when all deletions succeed", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteCustomer.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDeleteMany(["1", "2"])
    })

    expect(ok).toBe(true)
    expect(mockGetCustomers).toHaveBeenCalledTimes(2)
    expect(mockToastSuccess).toHaveBeenCalledWith("deleteManySuccess")
    expect(mockToastError).not.toHaveBeenCalled()
  })

  it("handleDeleteMany toasts a partial-fail message when some deletions fail", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteCustomer.mockImplementation(async (id: string) =>
      id === "1"
        ? { data: undefined, error: null }
        : { data: null, error: { message: "failed", code: "SERVER_ERROR", status: 500 } }
    )

    let ok = true
    await act(async () => {
      ok = await result.current.handleDeleteMany(["1", "2"])
    })

    expect(ok).toBe(false)
    expect(mockToastError).toHaveBeenCalledWith("deleteManyPartialFail")
  })
})
