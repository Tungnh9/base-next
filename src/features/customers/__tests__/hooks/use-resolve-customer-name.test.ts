import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-customer-options", () => ({
  useCustomerOptions: vi.fn(),
}))

import { useResolveCustomerName } from "../../hooks/use-resolve-customer-name"
import { useCustomerOptions } from "../../hooks/use-customer-options"

const mockUseCustomerOptions = vi.mocked(useCustomerOptions)

const options = [{ id: "1", name: "Nguyễn Văn An", code: "2VT-C00001" }]

describe("useResolveCustomerName", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns undefined for an unset id", () => {
    mockUseCustomerOptions.mockReturnValue({ options, isLoading: false })
    const { result } = renderHook(() => useResolveCustomerName())

    expect(result.current(undefined)).toBeUndefined()
  })

  it("returns undefined (not an 'unknown' label) for a valid id while options are still loading", () => {
    mockUseCustomerOptions.mockReturnValue({ options: [], isLoading: true })
    const { result } = renderHook(() => useResolveCustomerName())

    expect(result.current("1")).toBeUndefined()
  })

  it("resolves a matching id to its customer name once loaded", () => {
    mockUseCustomerOptions.mockReturnValue({ options, isLoading: false })
    const { result } = renderHook(() => useResolveCustomerName())

    expect(result.current("1")).toBe("Nguyễn Văn An")
  })

  it("returns the unknown-customer placeholder for a non-matching id once loaded", () => {
    mockUseCustomerOptions.mockReturnValue({ options, isLoading: false })
    const { result } = renderHook(() => useResolveCustomerName())

    expect(result.current("99")).toBe("unknownCustomer")
  })
})
