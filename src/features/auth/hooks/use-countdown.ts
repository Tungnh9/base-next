"use client"

import { useEffect, useState } from "react"

// Ticks once per second by updating `now`; remainingMs is derived during
// render from `targetTimestamp - now` rather than stored directly in state,
// so the effect only sets up/tears down the interval — the setState call
// lives inside the interval callback, not synchronously in the effect body.
export function useCountdownMs(targetTimestamp: number | null): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!targetTimestamp) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [targetTimestamp])

  if (!targetTimestamp) return 0
  return Math.max(0, targetTimestamp - now)
}
