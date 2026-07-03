"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type SwitchColor = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark"

const SWITCH_COLOR_CLASSES: Record<SwitchColor, string> = {
  primary:   "focus-visible:border-primary    focus-visible:ring-primary/30    data-[state=checked]:bg-primary",
  secondary: "focus-visible:border-secondary  focus-visible:ring-secondary/30  data-[state=checked]:bg-secondary",
  success:   "focus-visible:border-success    focus-visible:ring-success/30    data-[state=checked]:bg-success",
  danger:    "focus-visible:border-destructive focus-visible:ring-destructive/30 data-[state=checked]:bg-destructive",
  warning:   "focus-visible:border-warning    focus-visible:ring-warning/30    data-[state=checked]:bg-warning",
  info:      "focus-visible:border-info       focus-visible:ring-info/30       data-[state=checked]:bg-info",
  dark:      "focus-visible:border-foreground focus-visible:ring-foreground/30 data-[state=checked]:bg-foreground",
}

// Figma: 30x18 pill track, 12px thumb inset 3px. Unchecked = card bg + border,
// thumb tinted border color. Checked = primary fill + drop-shadow, white thumb.
// Disabled unchecked swaps to a flat border-colored fill (no stroke) with a
// darker thumb; disabled checked keeps the checked look at 50% opacity.
function Switch({
  className,
  color = "primary",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  color?: SwitchColor
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[18px] w-[30px] shrink-0 cursor-pointer items-center rounded-full border border-border bg-card outline-none transition-colors",
        "focus-visible:ring-[3px]",
        "data-[state=checked]:border-transparent data-[state=checked]:shadow-[0px_2px_4px_rgba(165,163,174,0.3)]",
        "disabled:cursor-not-allowed",
        "disabled:data-[state=unchecked]:border-transparent disabled:data-[state=unchecked]:bg-border",
        "disabled:data-[state=checked]:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        SWITCH_COLOR_CLASSES[color],
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none absolute top-1/2 left-[3px] size-3 -translate-y-1/2 rounded-full bg-border transition-transform data-[state=checked]:translate-x-3 data-[state=checked]:bg-primary-foreground data-[disabled]:data-[state=unchecked]:bg-foreground/[0.4]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
export type { SwitchColor }
