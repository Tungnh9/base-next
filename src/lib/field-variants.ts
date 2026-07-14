// Shared Figma field-size scale (sm/default/lg) — keeps radius/padding/font-size
// in sync across Input, Textarea and Select's trigger instead of each redefining
// the same px values independently.
export const FIELD_SIZE = {
  sm: { radius: "rounded-[4px]", px: "px-[10px]", text: "text-[13px]" },
  default: { radius: "rounded-[6px]", px: "px-[14px]", text: "text-[15px]" },
  lg: { radius: "rounded-[8px]", px: "px-4", text: "text-[18px]" },
} as const

// Shared border/focus/validation treatment for fields that wrap a native
// <input>/<textarea> and rely on :focus-within (Select uses :focus-visible on
// its own trigger button instead, so it doesn't share this string).
// aria-invalid: targets the element itself (Textarea renders the control directly).
// has-[input[aria-invalid=true]]: targets wrapper divs (Input) where aria-invalid lives on the inner <input>.
// Both selectors are listed after data-[valid=true] so an error always overrides a stale isValid=true.
export const FIELD_VALIDATION_CLASSES =
  "focus-within:border-primary focus-within:shadow-[0px_2px_2px_rgba(165,163,174,0.3)] data-[valid=true]:border-success data-[valid=true]:focus-within:border-success aria-invalid:border-destructive has-[input[aria-invalid=true]]:border-destructive dark:aria-invalid:border-destructive dark:has-[input[aria-invalid=true]]:border-destructive"
