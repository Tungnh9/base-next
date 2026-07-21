import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useSessionExpiryWarning } from "../use-session-expiry"

describe("useSessionExpiryWarning", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("fires onExpiringSoon warnBeforeMs before exp elapses", () => {
    const onExpiringSoon = vi.fn()
    // exp in unix seconds — expires at 600_000ms; default warnBeforeMs is 5min.
    renderHook(() => useSessionExpiryWarning(600, onExpiringSoon))

    vi.advanceTimersByTime(300_000 - 1)
    expect(onExpiringSoon).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onExpiringSoon).toHaveBeenCalledOnce()
  })

  it("respects a custom warnBeforeMs", () => {
    const onExpiringSoon = vi.fn()
    renderHook(() => useSessionExpiryWarning(60, onExpiringSoon, 10_000))

    vi.advanceTimersByTime(50_000 - 1)
    expect(onExpiringSoon).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onExpiringSoon).toHaveBeenCalledOnce()
  })

  it("does nothing when expUnixSeconds is undefined", () => {
    const onExpiringSoon = vi.fn()
    renderHook(() => useSessionExpiryWarning(undefined, onExpiringSoon))

    vi.advanceTimersByTime(10_000_000)
    expect(onExpiringSoon).not.toHaveBeenCalled()
  })

  it("does nothing when exp has already passed", () => {
    vi.setSystemTime(1_000_000)
    const onExpiringSoon = vi.fn()
    // exp=600s -> 600_000ms, already before the current system time.
    renderHook(() => useSessionExpiryWarning(600, onExpiringSoon))

    vi.advanceTimersByTime(10_000)
    expect(onExpiringSoon).not.toHaveBeenCalled()
  })

  it("fires on the next tick when the warn point already passed but exp has not", () => {
    // exp=600s -> 600_000ms. warnAt = 600_000 - 300_000 = 300_000ms, which is
    // already behind "now" (590_000ms), but exp itself is still ahead.
    vi.setSystemTime(590_000)
    const onExpiringSoon = vi.fn()
    renderHook(() => useSessionExpiryWarning(600, onExpiringSoon))

    vi.advanceTimersByTime(0)
    expect(onExpiringSoon).toHaveBeenCalledOnce()
  })

  it("clears the pending timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout")
    const onExpiringSoon = vi.fn()
    const { unmount } = renderHook(() => useSessionExpiryWarning(600, onExpiringSoon))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    vi.advanceTimersByTime(600_000)
    expect(onExpiringSoon).not.toHaveBeenCalled()
  })

  it("reschedules against the new exp when it changes", () => {
    const onExpiringSoon = vi.fn()
    const { rerender } = renderHook(
      ({ exp }: { exp: number }) => useSessionExpiryWarning(exp, onExpiringSoon),
      { initialProps: { exp: 600 } }
    )

    // Move exp far into the future before the original warning would fire —
    // the stale timeout must not fire.
    rerender({ exp: 6_000 })

    vi.advanceTimersByTime(300_000)
    expect(onExpiringSoon).not.toHaveBeenCalled()

    vi.advanceTimersByTime(6_000_000 - 300_000 - 300_000)
    expect(onExpiringSoon).toHaveBeenCalledOnce()
  })
})
