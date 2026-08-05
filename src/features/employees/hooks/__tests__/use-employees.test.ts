import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../../actions", () => ({
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { useEmployees } from "../use-employees"
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../../actions"
import { toast } from "sonner"
import type { Employee } from "../../types"

const mockGetEmployees = vi.mocked(getEmployees)
const mockCreateEmployee = vi.mocked(createEmployee)
const mockUpdateEmployee = vi.mocked(updateEmployee)
const mockDeleteEmployee = vi.mocked(deleteEmployee)
const mockToastError = vi.mocked(toast.error)
const mockToastSuccess = vi.mocked(toast.success)

const employeeA: Employee = {
  id: "1",
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  department: "engineering",
  position: "Frontend Engineer",
  status: "active",
  joinedAt: "2024-01-01T00:00:00.000Z",
}
const employeeB: Employee = {
  id: "2",
  name: "Lê Minh Châu",
  email: "chau@example.com",
  phone: "0923456789",
  department: "sales",
  position: "Sales Executive",
  status: "inactive",
  joinedAt: "2024-02-01T00:00:00.000Z",
}

function pageOf(
  data: Employee[],
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

describe("useEmployees", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEmployees.mockResolvedValue(pageOf([employeeA, employeeB]))
  })

  it("starts with isLoading=true, then loads employees from getEmployees on mount", async () => {
    const { result } = renderHook(() => useEmployees())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.employees).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.employees).toEqual([employeeA, employeeB])
    expect(mockGetEmployees).toHaveBeenCalledWith({ page: 1, pageSize: 10, search: "" })
  })

  it("toasts an error and stops loading when getEmployees resolves with an error", async () => {
    mockGetEmployees.mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })

    const { result } = renderHook(() => useEmployees())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.employees).toEqual([])
    expect(mockToastError).toHaveBeenCalledWith("boom")
  })

  it("setPage refetches with the new page number", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Echo the requested page back (as a real, non-clamping response would)
    // so the page-sync guard in the effect has nothing to correct here.
    mockGetEmployees.mockImplementation(async ({ page: requestedPage = 1 } = {}) =>
      pageOf([employeeA, employeeB], { page: requestedPage })
    )

    act(() => result.current.setPage(2))
    await waitFor(() => expect(mockGetEmployees).toHaveBeenCalledTimes(2))

    expect(mockGetEmployees).toHaveBeenLastCalledWith({ page: 2, pageSize: 10, search: "" })
  })

  it("setSearch resets back to page 1", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPage(3))
    await waitFor(() => expect(result.current.page).toBe(3))

    act(() => result.current.setSearch("an"))

    expect(result.current.page).toBe(1)
    await waitFor(() =>
      expect(mockGetEmployees).toHaveBeenLastCalledWith({ page: 1, pageSize: 10, search: "an" })
    )
  })

  it("refresh() sets isLoading and refetches with the same page/search", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.refresh())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetEmployees).toHaveBeenCalledTimes(2)
  })

  it("handleCreate refetches and returns true on success", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockCreateEmployee.mockResolvedValue({
      data: { ...employeeA, id: "3", name: "New Employee" },
      error: null,
    })

    let ok = false
    await act(async () => {
      ok = await result.current.handleCreate({
        name: "New Employee",
        email: "new@example.com",
        phone: "0900000000",
        department: "engineering",
        position: "QA Engineer",
        status: "active",
      })
    })

    expect(ok).toBe(true)
    expect(mockGetEmployees).toHaveBeenCalledTimes(2) // initial load + refresh after create
    expect(mockToastSuccess).toHaveBeenCalledWith("createSuccess")
  })

  it("handleCreate toasts the error and returns false without refetching on failure", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockCreateEmployee.mockResolvedValue({
      data: null,
      error: { message: "invalid", code: "VALIDATION_ERROR", status: 400 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.handleCreate({
        name: "",
        email: "",
        phone: "",
        department: "engineering",
        position: "",
        status: "active",
      })
    })

    expect(ok).toBe(false)
    expect(mockGetEmployees).toHaveBeenCalledTimes(1) // no refresh on failure
    expect(mockToastError).toHaveBeenCalledWith("invalid")
  })

  it("handleUpdate replaces the matching employee in place without refetching", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const updated: Employee = { ...employeeA, name: "Updated Name" }
    mockUpdateEmployee.mockResolvedValue({ data: updated, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleUpdate("1", { name: "Updated Name" })
    })

    expect(ok).toBe(true)
    expect(result.current.employees.find((e) => e.id === "1")).toEqual(updated)
    expect(mockGetEmployees).toHaveBeenCalledTimes(1) // in-place update, no refresh
  })

  it("handleDelete refetches and returns true on success", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteEmployee.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDelete("1")
    })

    expect(ok).toBe(true)
    expect(mockGetEmployees).toHaveBeenCalledTimes(2)
    expect(mockToastSuccess).toHaveBeenCalledWith("deleteSuccess")
  })

  it("syncs page down to the server-clamped page after deleting the last row of the last page (regression guard)", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Move to the last page (3 of 3), echoing the requested page back
    // normally — nothing to clamp yet.
    mockGetEmployees.mockImplementation(async ({ page: requestedPage = 1 } = {}) => ({
      data: { data: [employeeA], total: 21, page: requestedPage, pageSize: 10, totalPages: 3 },
      error: null,
    }))
    act(() => result.current.setPage(3))
    await waitFor(() => expect(result.current.page).toBe(3))
    await waitFor(() =>
      expect(mockGetEmployees).toHaveBeenLastCalledWith({ page: 3, pageSize: 10, search: "" })
    )

    // Deleting the last row on page 3 makes the server clamp back to page 2
    // (mirrors mock-data.ts's own `Math.min(Math.max(1, page), totalPages)`) —
    // still requested as page 3 (stale local state) but the response says 2.
    mockDeleteEmployee.mockResolvedValue({ data: undefined, error: null })
    mockGetEmployees.mockResolvedValue({
      data: { data: [employeeA, employeeB], total: 20, page: 2, pageSize: 10, totalPages: 2 },
      error: null,
    })

    await act(async () => {
      await result.current.handleDelete("1")
    })

    await waitFor(() => expect(result.current.page).toBe(2))
    // One extra self-correcting refetch at the corrected page number.
    expect(mockGetEmployees).toHaveBeenLastCalledWith({ page: 2, pageSize: 10, search: "" })
  })

  it("handleDeleteMany refetches once and toasts success when all deletions succeed", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteEmployee.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDeleteMany(["1", "2"])
    })

    expect(ok).toBe(true)
    expect(mockGetEmployees).toHaveBeenCalledTimes(2)
    expect(mockToastSuccess).toHaveBeenCalledWith("deleteManySuccess")
    expect(mockToastError).not.toHaveBeenCalled()
  })

  it("handleDeleteMany toasts a partial-fail message when some deletions fail", async () => {
    const { result } = renderHook(() => useEmployees())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteEmployee.mockImplementation(async (id: string) =>
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
