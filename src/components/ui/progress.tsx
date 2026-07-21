"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { COLOR_VARIANT_CLASSES } from "./color-variants"

// ─── Track (root container) ───────────────────────────────────────────────────

const progressTrackVariants = cva("relative w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    size: {
      sm: "h-1.5",
      default: "h-2.5",
      lg: "h-4",
    },
  },
  defaultVariants: { size: "default" },
})

// ─── Indicator (fill bar) ─────────────────────────────────────────────────────

const progressIndicatorVariants = cva(
  // Fix #6: transition-[width] instead of transition-all to avoid monitoring
  // every CSS property — only width changes at runtime.
  "h-full transition-[width] duration-300 ease-in-out",
  {
    variants: {
      variant: COLOR_VARIANT_CLASSES,
      skin: {
        default: "",
        striped: "progress-striped",
      },
    },
    defaultVariants: { variant: "primary", skin: "default" },
  }
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clampPct(v: number, max: number): number {
  return Math.min(100, Math.max(0, (v / max) * 100))
}

// ─── Progress ─────────────────────────────────────────────────────────────────

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressTrackVariants> &
  VariantProps<typeof progressIndicatorVariants>

function Progress({
  className,
  value,
  max = 100,
  variant = "primary",
  skin = "default",
  size = "default",
  ...props
}: ProgressProps) {
  // Fix #1: factor in max when computing display percentage.
  // Fix #2: pass the original value (not pct) to Radix so null/undefined
  //         correctly produces data-state="indeterminate" for ARIA + CSS hooks.
  const pct = value == null ? 0 : clampPct(value, max)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={variant}
      data-skin={skin}
      className={cn(progressTrackVariants({ size }), className)}
      value={value ?? null}
      max={max}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(progressIndicatorVariants({ variant, skin }), "rounded-full")}
        style={{ width: `${pct}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

// ─── ProgressStack ────────────────────────────────────────────────────────────

// Fix #3: expose a `value` prop so callers can supply the aggregate progress
// (sum of all segments), which becomes aria-valuenow. Without it, the element
// is correctly treated as indeterminate by screen readers rather than reporting
// a broken/missing value.
type ProgressStackProps = React.ComponentProps<"div"> &
  VariantProps<typeof progressTrackVariants> & {
    /** Total progress 0-100 (sum of all segments). Omit for indeterminate. */
    value?: number
  }

function ProgressStack({
  className,
  size = "default",
  value,
  children,
  ...props
}: ProgressStackProps) {
  return (
    <div
      data-slot="progress-stack"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn(progressTrackVariants({ size }), "flex", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── ProgressSegment ──────────────────────────────────────────────────────────

type ProgressSegmentProps = React.ComponentProps<"div"> &
  VariantProps<typeof progressIndicatorVariants> & {
    value: number
  }

function ProgressSegment({
  className,
  value,
  variant = "primary",
  skin = "default",
  ...props
}: ProgressSegmentProps) {
  // Fix #4: guard against NaN — Math.max(0, NaN) === NaN which would produce
  //         style={{ width: "NaN%" }}, causing the segment to silently collapse.
  const pct = clampPct(Number.isFinite(value) ? value : 0, 100)

  return (
    <div
      data-slot="progress-segment"
      data-variant={variant}
      data-skin={skin} // Fix #7: mirror Progress — needed for attribute-based CSS/JS selectors
      className={cn(progressIndicatorVariants({ variant, skin }), className)}
      style={{ width: `${pct}%` }}
      {...props}
    />
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Progress, ProgressStack, ProgressSegment }
export { progressTrackVariants, progressIndicatorVariants }
export type { ProgressProps, ProgressStackProps, ProgressSegmentProps }

type ProgressVariant = NonNullable<VariantProps<typeof progressIndicatorVariants>["variant"]>
type ProgressSkin = NonNullable<VariantProps<typeof progressIndicatorVariants>["skin"]>
type ProgressSize = NonNullable<VariantProps<typeof progressTrackVariants>["size"]>
export type { ProgressVariant, ProgressSkin, ProgressSize }
