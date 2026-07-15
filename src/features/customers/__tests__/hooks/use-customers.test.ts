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
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  company: "ABC",
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
}
const customerB: Customer = {
  id: "2",
  name: "Lê Minh Châu",
  email: "chau@example.com",
  phone: "0923456789",
  company: "XYZ",
  status: "inactive",
  createdAt: "2024-02-01T00:00:00.000Z",
}

describe("useCustomers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCustomers.mockResolvedValue({ data: [customerA, customerB], error: null })
  })

  it("starts with isLoading=true, then loads customers from getCustomers on mount", async () => {
    const { result } = renderHook(() => useCustomers())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.customers).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.customers).toEqual([customerA, customerB])
    expect(mockGetCustomers).toHaveBeenCalledOnce()
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

  it("refresh() sets isLoading and refetches", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.refresh())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetCustomers).toHaveBeenCalledTimes(2)
  })

  it("handleCreate appends the new customer and returns true on success", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const newCustomer: Customer = { ...customerA, id: "3", name: "New Customer" }
    mockCreateCustomer.mockResolvedValue({ data: newCustomer, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleCreate({
        name: "New Customer",
        email: "new@example.com",
        phone: "0900000000",
        company: "ABC",
        status: "active",
      })
    })

    expect(ok).toBe(true)
    expect(result.current.customers).toContainEqual(newCustomer)
    expect(mockToastSuccess).toHaveBeenCalled()
  })

  it("handleCreate toasts the error and returns false without mutating customers on failure", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const before = result.current.customers

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
        status: "active",
      })
    })

    expect(ok).toBe(false)
    expect(result.current.customers).toEqual(before)
    expect(mockToastError).toHaveBeenCalledWith("invalid")
  })

  it("handleUpdate replaces the matching customer by id and returns true", async () => {
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

  it("handleDelete removes the customer by id and returns true on success", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteCustomer.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDelete("1")
    })

    expect(ok).toBe(true)
    expect(result.current.customers.map((c) => c.id)).toEqual(["2"])
  })

  it("handleDelete returns false and leaves customers unchanged on error", async () => {
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
    expect(result.current.customers.map((c) => c.id)).toEqual(["1", "2"])
  })

  it("handleDeleteMany removes only the successfully-deleted ids when some fail", async () => {
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
    expect(result.current.customers.map((c) => c.id)).toEqual(["2"])
    expect(mockToastError).toHaveBeenCalledWith("deleteManyPartialFail")
  })

  it("handleDeleteMany returns true and toasts success when all deletions succeed", async () => {
    const { result } = renderHook(() => useCustomers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockDeleteCustomer.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.handleDeleteMany(["1", "2"])
    })

    expect(ok).toBe(true)
    expect(result.current.customers).toEqual([])
    expect(mockToastSuccess).toHaveBeenCalledWith("deleteManySuccess")
    expect(mockToastError).not.toHaveBeenCalled()
  })
})
