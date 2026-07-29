import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../use-employee-options", () => ({
  useEmployeeOptions: vi.fn(),
}))

import { useResolveEmployeeName } from "../use-resolve-employee-name"
import { useEmployeeOptions } from "../use-employee-options"

const mockUseEmployeeOptions = vi.mocked(useEmployeeOptions)

const options = [{ id: "1", name: "Nguyễn Văn An", department: "sales" as const }]

describe("useResolveEmployeeName", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns undefined for an unset id", () => {
    mockUseEmployeeOptions.mockReturnValue({ options, isLoading: false })
    const { result } = renderHook(() => useResolveEmployeeName())

    expect(result.current(undefined)).toBeUndefined()
  })

  it("returns undefined (not an 'unknown' label) for a valid id while options are still loading", () => {
    mockUseEmployeeOptions.mockReturnValue({ options: [], isLoading: true })
    const { result } = renderHook(() => useResolveEmployeeName())

    expect(result.current("1")).toBeUndefined()
  })

  it("resolves a matching id to its employee name once loaded", () => {
    mockUseEmployeeOptions.mockReturnValue({ options, isLoading: false })
    const { result } = renderHook(() => useResolveEmployeeName())

    expect(result.current("1")).toBe("Nguyễn Văn An")
  })

  it("returns the unknown-employee placeholder for a non-matching id once loaded", () => {
    mockUseEmployeeOptions.mockReturnValue({ options, isLoading: false })
    const { result } = renderHook(() => useResolveEmployeeName())

    expect(result.current("99")).toBe("unknownEmployee")
  })
})
