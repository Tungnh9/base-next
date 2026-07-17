import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useCountdownMs } from "../use-countdown"

describe("useCountdownMs", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 0 when targetTimestamp is null", () => {
    const { result } = renderHook(() => useCountdownMs(null))

    expect(result.current).toBe(0)
  })

  it("returns the initial remaining time on mount", () => {
    const { result } = renderHook(() => useCountdownMs(10_000))

    expect(result.current).toBe(10_000)
  })

  it("ticks down once per second", () => {
    const { result } = renderHook(() => useCountdownMs(5_000))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current).toBe(4_000)
  })

  it("never goes below 0 once the target has passed", () => {
    const { result } = renderHook(() => useCountdownMs(1_000))

    act(() => {
      vi.advanceTimersByTime(5_000)
    })

    expect(result.current).toBe(0)
  })

  it("clears the interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval")
    const { unmount } = renderHook(() => useCountdownMs(5_000))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it("recomputes against the new target when targetTimestamp changes", () => {
    const { result, rerender } = renderHook(({ target }) => useCountdownMs(target), {
      initialProps: { target: 5_000 as number | null },
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toBe(4_000)

    rerender({ target: 10_000 })

    expect(result.current).toBe(9_000)
  })
})
