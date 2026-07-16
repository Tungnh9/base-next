// Demo/template fallback — shown when the two-step page has no ?phone= query
// param (e.g. navigated to directly, not via the login → 2FA redirect). A real
// backend would always supply the phone tied to the 2FA-enrolled account.
export const DEMO_MASKED_PHONE_FALLBACK = "⁎⁎⁎⁎⁎⁎9763"

/**
 * Masks all but the last 4 characters of a phone number with "⁎".
 * - Empty input → DEMO_MASKED_PHONE_FALLBACK.
 * - Input of 4 or fewer characters is returned unmasked as-is (nothing left
 *   to hide beyond the visible "last 4").
 * - Operates purely on string length/slicing; does not validate that the
 *   input is numeric, so non-numeric characters are masked identically.
 */
export function maskPhone(phone: string): string {
  if (!phone) return DEMO_MASKED_PHONE_FALLBACK
  const visible = phone.slice(-4)
  const maskedLength = Math.max(0, phone.length - visible.length)
  return "⁎".repeat(maskedLength) + visible
}

/**
 * Formats a millisecond duration as "m:ss" for a countdown display.
 * Rounds up to the next second so the display never shows "0:00" while time
 * still remains.
 */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}
