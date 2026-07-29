import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../../actions", () => ({
  getCustomerOptions: vi.fn(),
}))

const options = [
  { id: "1", name: "Nguyễn Văn An", code: "2VT-C00001" },
  { id: "2", name: "Trần Thị B", code: "3TC-C00002" },
]

describe("useCustomerOptions", () => {
  // The hook caches its result at module scope so it survives across every
  // filter-bar/table mount within a session — that means the cache must be
  // reset between tests too, via a fresh module registry per test.
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("starts loading, then resolves to the fetched options", async () => {
    const { getCustomerOptions } = await import("../../actions")
    vi.mocked(getCustomerOptions).mockResolvedValue({ data: options, error: null })
    const { useCustomerOptions } = await import("../../hooks/use-customer-options")

    const { result } = renderHook(() => useCustomerOptions())

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.options).toEqual(options)
  })

  it("returns an empty list and stops loading on error, without throwing", async () => {
    const { getCustomerOptions } = await import("../../actions")
    vi.mocked(getCustomerOptions).mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })
    const { useCustomerOptions } = await import("../../hooks/use-customer-options")

    const { result } = renderHook(() => useCustomerOptions())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.options).toEqual([])
  })

  it("caches across hook instances — a second mount does not refetch", async () => {
    const { getCustomerOptions } = await import("../../actions")
    vi.mocked(getCustomerOptions).mockResolvedValue({ data: options, error: null })
    const { useCustomerOptions } = await import("../../hooks/use-customer-options")

    const first = renderHook(() => useCustomerOptions())
    await waitFor(() => expect(first.result.current.isLoading).toBe(false))

    const second = renderHook(() => useCustomerOptions())
    expect(second.result.current.isLoading).toBe(false)
    expect(second.result.current.options).toEqual(options)
    expect(getCustomerOptions).toHaveBeenCalledTimes(1)
  })

  it("does not permanently cache a failed fetch — a later mount retries instead of reusing the empty result", async () => {
    const { getCustomerOptions } = await import("../../actions")
    vi.mocked(getCustomerOptions).mockResolvedValueOnce({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })
    const { useCustomerOptions } = await import("../../hooks/use-customer-options")

    const first = renderHook(() => useCustomerOptions())
    await waitFor(() => expect(first.result.current.isLoading).toBe(false))
    expect(first.result.current.options).toEqual([])

    vi.mocked(getCustomerOptions).mockResolvedValueOnce({ data: options, error: null })
    const second = renderHook(() => useCustomerOptions())
    await waitFor(() => expect(second.result.current.isLoading).toBe(false))

    expect(second.result.current.options).toEqual(options)
    expect(getCustomerOptions).toHaveBeenCalledTimes(2)
  })
})
