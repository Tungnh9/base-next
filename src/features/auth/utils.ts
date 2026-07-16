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

// Character-class rules mirror STRONG_PASSWORD_REGEX in schemas.ts, split out
// individually so each can drive its own checklist row in the UI.
export interface PasswordRequirement {
  key: "minLength" | "uppercase" | "lowercase" | "digit" | "specialChar"
  test: (password: string) => boolean
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: "minLength", test: (v) => v.length >= 8 },
  { key: "uppercase", test: (v) => /[A-Z]/.test(v) },
  { key: "lowercase", test: (v) => /[a-z]/.test(v) },
  { key: "digit", test: (v) => /\d/.test(v) },
  { key: "specialChar", test: (v) => /[^A-Za-z0-9\s]/.test(v) },
]

export type PasswordStrength = "weak" | "medium" | "strong"

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "weak"
  const passed = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length
  if (passed <= 2) return "weak"
  if (passed <= 4) return "medium"
  return "strong"
}
