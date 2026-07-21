"use client"

import { useEffect } from "react"

// Schedules a single warning fire before the session's JWT `exp` (unix
// seconds) elapses. This is a client-side UX nudge only — there is no
// refresh-token endpoint on the backend, so the session cannot actually be
// extended; see docs/auth.md. On expiry, getSession()/verifyToken() simply
// starts returning null and the next navigation is redirected to /login by
// proxy.ts / the (protected) layout guard.
export function useSessionExpiryWarning(
  expUnixSeconds: number | undefined,
  onExpiringSoon: () => void,
  warnBeforeMs = 5 * 60_000
): void {
  useEffect(() => {
    if (!expUnixSeconds) return

    const expiresAtMs = expUnixSeconds * 1000
    const now = Date.now()

    // Already expired — nothing to warn about, the guard will handle it on
    // the next navigation.
    if (expiresAtMs <= now) return

    const warnAtMs = expiresAtMs - warnBeforeMs
    // If the warning point already passed (e.g. warnBeforeMs is larger than
    // the session's remaining lifetime) but exp itself hasn't, fire on the
    // next tick instead of missing the warning entirely.
    const delay = Math.max(0, warnAtMs - now)

    const id = setTimeout(onExpiringSoon, delay)
    return () => clearTimeout(id)
  }, [expUnixSeconds, onExpiringSoon, warnBeforeMs])
}
