// Single source of truth for the OpportunityStatus union — types.ts derives
// the type from this, schemas.ts feeds it straight into z.enum(). Display
// labels for every value here live in next-intl (messages/*.json), never as
// hardcoded strings in this file.
export const OPPORTUNITY_STATUSES = ["processing", "pending-approval", "transferred"] as const

// Same rationale as customers' Giá trị HĐ formatting: `₫` comes from ICU
// currency data, not a hardcoded string literal, and this matches the
// codebase's existing Intl.* usage (toLocaleDateString("vi-VN") for dates).
export function formatContractValue(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}
