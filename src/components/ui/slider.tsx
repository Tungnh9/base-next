"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// ─── Shared color variant map ─────────────────────────────────────────────────

const COLOR_VARIANTS = {
  default:   "bg-secondary",
  primary:   "bg-primary",
  success:   "bg-success",
  danger:    "bg-destructive",
  warning:   "bg-warning",
  info:      "bg-info",
  dark:      "bg-foreground",
} as const

// ─── Range fill ───────────────────────────────────────────────────────────────

const sliderRangeVariants = cva("absolute rounded-full", {
  variants: { variant: COLOR_VARIANTS },
  defaultVariants: { variant: "primary" },
})

// ─── Thumb ────────────────────────────────────────────────────────────────────

const sliderThumbVariants = cva(
  "block cursor-grab rounded-full shadow-sm active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: COLOR_VARIANTS,
      size: {
        sm:      "size-2.5",
        default: "size-3.5",
        lg:      "size-[18px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

// ─── Track thickness per size ─────────────────────────────────────────────────

const TRACK_THICKNESS: Record<SliderSize, { h: string; w: string }> = {
  sm:      { h: "h-0.5", w: "w-0.5" },
  default: { h: "h-1",   w: "w-1"   },
  lg:      { h: "h-1.5", w: "w-1.5" },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function valuePct(v: number, min: number, max: number): number {
  return ((v - min) / (max - min)) * 100
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SliderVariant = keyof typeof COLOR_VARIANTS
type SliderSize    = "sm" | "default" | "lg"

type SliderProps = Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "orientation"> & {
  variant?:     SliderVariant
  size?:        SliderSize
  orientation?: "horizontal" | "vertical"
  /** Show floating value labels above (horizontal) or beside (vertical) each thumb */
  showLabel?:   boolean
  /** Show tick marks with numeric scale */
  showTicks?:   boolean
  /** Interval between ticks; defaults to (max - min) / 10 */
  tickStep?:    number
  /** Format each thumb label; defaults to String */
  formatLabel?: (v: number) => string
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({
  className,
  variant     = "primary",
  size        = "default",
  orientation = "horizontal",
  showLabel   = false,
  showTicks   = false,
  tickStep,
  formatLabel = String,
  min         = 0,
  max         = 100,
  step        = 1,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SliderProps) {
  const isVertical = orientation === "vertical"
  const tt = TRACK_THICKNESS[size]

  // In controlled mode, derive labels from value directly (no stale-frame lag).
  // In uncontrolled mode, track via localVals which handleValueChange keeps current.
  const [localVals, setLocalVals] = React.useState<number[]>(defaultValue ?? [min])
  const displayVals = value !== undefined ? value : localVals

  const handleValueChange = React.useCallback(
    (v: number[]) => {
      setLocalVals(v)
      onValueChange?.(v)
    },
    [onValueChange]
  )

  const effectiveTickStep = tickStep ?? Math.max((max - min) / 10, step)
  const ticks = React.useMemo(() => {
    if (effectiveTickStep <= 0) return []
    const arr: number[] = []
    for (let v = min; v <= max + 1e-9; v += effectiveTickStep) {
      arr.push(Math.round(v * 1e6) / 1e6)
    }
    return arr
  }, [min, max, effectiveTickStep])

  return (
    <div
      data-slot="slider-wrapper"
      data-orientation={orientation}
      className={cn(
        "relative",
        isVertical
          ? cn(
              "inline-flex h-full flex-row items-center",
              showTicks  && "pl-12",
              showLabel  && "pr-14",
              (showTicks || showLabel) && "py-3",
            )
          : cn(
              "flex w-full flex-col",
              showLabel  && "pt-7",
              showTicks  && "pb-6",
            ),
        className
      )}
    >
      {/* ── Value labels ─────────────────────────────────────────────── */}
      {showLabel && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute",
            isVertical ? "inset-y-3 right-0 w-12" : "inset-x-0 top-0 h-6"
          )}
        >
          {displayVals.map((v, i) => {
            const p = valuePct(v, min, max)
            return (
              <span
                key={i}
                className="absolute flex items-center justify-center rounded bg-foreground text-[10px] font-medium leading-none px-1.5 py-1 whitespace-nowrap"
                style={{
                  color: "var(--background)",
                  ...(isVertical
                    ? { bottom: `${p}%`, left: 0, transform: "translateY(50%)" }
                    : { left: `${p}%`, top: 0, transform: "translateX(-50%)" }),
                }}
              >
                {formatLabel(v)}
              </span>
            )
          })}
        </div>
      )}

      {/* ── Radix Slider ─────────────────────────────────────────────── */}
      <SliderPrimitive.Root
        data-slot="slider"
        orientation={orientation}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue ?? [min]}
        onValueChange={handleValueChange}
        className={cn(
          "relative flex touch-none select-none items-center",
          isVertical ? "h-full flex-col" : "w-full"
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden rounded-full bg-muted",
            isVertical ? tt.w : tt.h
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(sliderRangeVariants({ variant }), isVertical ? "w-full" : "h-full")}
          />
        </SliderPrimitive.Track>

        {displayVals.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            data-slot="slider-thumb"
            className={cn(sliderThumbVariants({ variant, size }))}
          />
        ))}
      </SliderPrimitive.Root>

      {/* ── Tick marks ───────────────────────────────────────────────── */}
      {showTicks && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute",
            isVertical ? "inset-y-3 left-0 w-12" : "inset-x-0 bottom-0 h-6"
          )}
        >
          {ticks.map((v) => {
            const p = valuePct(v, min, max)
            return (
              <span
                key={v}
                className={cn(
                  "absolute flex items-center gap-0.5",
                  isVertical
                    ? "flex-row -translate-y-1/2"
                    : "flex-col items-center -translate-x-1/2"
                )}
                style={
                  isVertical
                    ? { bottom: `${p}%`, right: 0 }
                    : { left: `${p}%`, top: 0 }
                }
              >
                {isVertical ? (
                  <>
                    <span className="text-[10px] text-muted-foreground leading-none">{v}</span>
                    <span className="block shrink-0 rounded-full bg-muted-foreground/40 h-px w-2" />
                  </>
                ) : (
                  <>
                    <span className="block shrink-0 rounded-full bg-muted-foreground/40 w-px h-1.5" />
                    <span className="text-[10px] text-muted-foreground leading-none">{v}</span>
                  </>
                )}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Slider }
export { sliderRangeVariants, sliderThumbVariants }
export type { SliderProps, SliderVariant, SliderSize }

type SliderVariantType = NonNullable<VariantProps<typeof sliderRangeVariants>["variant"]>
export type { SliderVariantType }
