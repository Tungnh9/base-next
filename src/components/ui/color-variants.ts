// Shared "variant name → bg-* class" map. Several components (Progress,
// Slider, Badge, and any custom bit that needs a plain colored swatch like
// dashboard/status-breakdown.tsx) all used to keep their own byte-identical
// copy of this — single source of truth instead.
export const COLOR_VARIANT_CLASSES = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  danger: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
  dark: "bg-foreground",
} as const

export type ColorVariant = keyof typeof COLOR_VARIANT_CLASSES
