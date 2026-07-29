import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../../actions", () => ({
  getEmployeeOptions: vi.fn(),
}))

const options = [
  { id: "1", name: "Nguyễn Văn An", department: "engineering" as const },
  { id: "2", name: "Trần Thị B", department: "sales" as const },
]

describe("useEmployeeOptions", () => {
  // The hook caches its result at module scope so it survives across every
  // CustomerForm mount within a session — that means the cache must be reset
  // between tests too, via a fresh module registry per test.
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("starts loading, then resolves to the fetched options", async () => {
    const { getEmployeeOptions } = await import("../../actions")
    vi.mocked(getEmployeeOptions).mockResolvedValue({ data: options, error: null })
    const { useEmployeeOptions } = await import("../use-employee-options")

    const { result } = renderHook(() => useEmployeeOptions())

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.options).toEqual(options)
  })

  it("returns an empty list and stops loading on error, without throwing", async () => {
    const { getEmployeeOptions } = await import("../../actions")
    vi.mocked(getEmployeeOptions).mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })
    const { useEmployeeOptions } = await import("../use-employee-options")

    const { result } = renderHook(() => useEmployeeOptions())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.options).toEqual([])
  })

  it("caches across hook instances — a second mount does not refetch", async () => {
    const { getEmployeeOptions } = await import("../../actions")
    vi.mocked(getEmployeeOptions).mockResolvedValue({ data: options, error: null })
    const { useEmployeeOptions } = await import("../use-employee-options")

    const first = renderHook(() => useEmployeeOptions())
    await waitFor(() => expect(first.result.current.isLoading).toBe(false))

    const second = renderHook(() => useEmployeeOptions())
    expect(second.result.current.isLoading).toBe(false)
    expect(second.result.current.options).toEqual(options)
    expect(getEmployeeOptions).toHaveBeenCalledTimes(1)
  })

  it("does not permanently cache a failed fetch — a later mount retries instead of reusing the empty result", async () => {
    const { getEmployeeOptions } = await import("../../actions")
    vi.mocked(getEmployeeOptions).mockResolvedValueOnce({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })
    const { useEmployeeOptions } = await import("../use-employee-options")

    const first = renderHook(() => useEmployeeOptions())
    await waitFor(() => expect(first.result.current.isLoading).toBe(false))
    expect(first.result.current.options).toEqual([])

    vi.mocked(getEmployeeOptions).mockResolvedValueOnce({ data: options, error: null })
    const second = renderHook(() => useEmployeeOptions())
    await waitFor(() => expect(second.result.current.isLoading).toBe(false))

    expect(second.result.current.options).toEqual(options)
    expect(getEmployeeOptions).toHaveBeenCalledTimes(2)
  })
})
