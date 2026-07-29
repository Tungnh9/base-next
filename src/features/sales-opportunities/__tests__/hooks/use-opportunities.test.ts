import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../../actions", () => ({
  getOpportunities: vi.fn(),
  deleteOpportunity: vi.fn(),
}))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { useOpportunities } from "../../hooks/use-opportunities"
import { getOpportunities, deleteOpportunity } from "../../actions"
import { toast } from "sonner"
import type { SalesOpportunity } from "../../types"

const mockGetOpportunities = vi.mocked(getOpportunities)
const mockDeleteOpportunity = vi.mocked(deleteOpportunity)
const mockToastError = vi.mocked(toast.error)
const mockToastSuccess = vi.mocked(toast.success)

const opportunityA: SalesOpportunity = {
  id: "1",
  name: "Deal A",
  customerId: "1",
  contractValue: 1_000_000,
  salesRepId: "1",
  status: "processing",
  createdAt: "2024-01-15T00:00:00.000Z",
}
const opportunityB: SalesOpportunity = {
  id: "2",
  name: "Deal B",
  customerId: "2",
  contractValue: 2_000_000,
  salesRepId: "2",
  status: "pending-approval",
  createdAt: "2024-02-15T00:00:00.000Z",
}

function pageOf(
  data: SalesOpportunity[],
  overrides: Partial<{ total: number; totalPages: number }> = {}
) {
  return {
    data: {
      data,
      total: overrides.total ?? data.length,
      page: 1,
      pageSize: 10,
      totalPages: overrides.totalPages ?? 1,
    },
    error: null,
  }
}

const baseParams = {
  page: 1,
  pageSize: 10,
  search: "",
  customerId: undefined,
  salesRepId: undefined,
  status: undefined,
  createdFrom: undefined,
  createdTo: undefined,
}

describe("useOpportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOpportunities.mockResolvedValue(pageOf([opportunityA, opportunityB]))
  })

  it("starts with isLoading=true, then loads opportunities from getOpportunities on mount", async () => {
    const { result } = renderHook(() => useOpportunities())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.opportunities).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.opportunities).toEqual([opportunityA, opportunityB])
    expect(mockGetOpportunities).toHaveBeenCalledWith(baseParams)
  })

  it("toasts an error and stops loading when getOpportunities resolves with an error", async () => {
    mockGetOpportunities.mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })

    const { result } = renderHook(() => useOpportunities())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.opportunities).toEqual([])
    expect(mockToastError).toHaveBeenCalledWith("boom")
  })

  it("setPage refetches with the new page number", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPage(2))
    await waitFor(() => expect(mockGetOpportunities).toHaveBeenCalledTimes(2))

    expect(mockGetOpportunities).toHaveBeenLastCalledWith({ ...baseParams, page: 2 })
  })

  it("setSearch resets back to page 1", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPage(3))
    await waitFor(() => expect(result.current.page).toBe(3))

    act(() => result.current.setSearch("deal"))

    expect(result.current.page).toBe(1)
    await waitFor(() =>
      expect(mockGetOpportunities).toHaveBeenLastCalledWith({ ...baseParams, search: "deal" })
    )
  })

  it("setCustomerId resets back to page 1 and refetches with the filter", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setCustomerId("1"))

    await waitFor(() =>
      expect(mockGetOpportunities).toHaveBeenLastCalledWith({ ...baseParams, customerId: "1" })
    )
  })

  it("setSalesRepId resets back to page 1 and refetches with the filter", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setSalesRepId("2"))

    await waitFor(() =>
      expect(mockGetOpportunities).toHaveBeenLastCalledWith({ ...baseParams, salesRepId: "2" })
    )
  })

  it("setStatus resets back to page 1 and refetches with the filter", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setStatus("transferred"))

    await waitFor(() =>
      expect(mockGetOpportunities).toHaveBeenLastCalledWith({
        ...baseParams,
        status: "transferred",
      })
    )
  })

  it("does not send createdFrom/createdTo when only the range's start has been picked", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setDateRange({ from: new Date(2024, 0, 15), to: undefined }))

    // No new fetch should fire with a half-picked range — give the effect a
    // tick to (not) run, then assert the call args stayed at their defaults.
    await waitFor(() => expect(result.current.page).toBe(1))
    expect(mockGetOpportunities).toHaveBeenLastCalledWith(baseParams)
  })

  it("sends createdFrom/createdTo as local YYYY-MM-DD strings once both ends of the range are picked", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() =>
      result.current.setDateRange({ from: new Date(2024, 0, 15), to: new Date(2024, 1, 20) })
    )

    await waitFor(() =>
      expect(mockGetOpportunities).toHaveBeenLastCalledWith({
        ...baseParams,
        createdFrom: "2024-01-15",
        createdTo: "2024-02-20",
      })
    )
  })

  it("refresh() sets isLoading and refetches with the same page/filters", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.refresh())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetOpportunities).toHaveBeenCalledTimes(2)
  })

  it("handleDelete refetches and returns true on success", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteOpportunity.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDelete("1")
    })

    expect(ok).toBe(true)
    expect(mockGetOpportunities).toHaveBeenCalledTimes(2)
    expect(mockToastSuccess).toHaveBeenCalledWith("deleteSuccess")
  })

  it("handleDelete returns false and does not refetch on error", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteOpportunity.mockResolvedValue({
      data: null,
      error: { message: "failed", code: "SERVER_ERROR", status: 500 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.handleDelete("1")
    })

    expect(ok).toBe(false)
    expect(mockGetOpportunities).toHaveBeenCalledTimes(1)
  })

  it("handleDeleteMany refetches once and toasts success when all deletions succeed", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteOpportunity.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDeleteMany(["1", "2"])
    })

    expect(ok).toBe(true)
    expect(mockGetOpportunities).toHaveBeenCalledTimes(2)
    expect(mockToastSuccess).toHaveBeenCalledWith("deleteManySuccess")
    expect(mockToastError).not.toHaveBeenCalled()
  })

  it("handleDeleteMany toasts a partial-fail message when some deletions fail", async () => {
    const { result } = renderHook(() => useOpportunities())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteOpportunity.mockImplementation(async (id: string) =>
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
