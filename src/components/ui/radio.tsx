"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type RadioColor = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark"

const RADIO_COLOR_CLASSES: Record<RadioColor, string> = {
  primary:   "focus-visible:border-primary    focus-visible:ring-primary/30    data-[state=checked]:border-primary",
  secondary: "focus-visible:border-secondary  focus-visible:ring-secondary/30  data-[state=checked]:border-secondary",
  success:   "focus-visible:border-success    focus-visible:ring-success/30    data-[state=checked]:border-success",
  danger:    "focus-visible:border-destructive focus-visible:ring-destructive/30 data-[state=checked]:border-destructive",
  warning:   "focus-visible:border-warning    focus-visible:ring-warning/30    data-[state=checked]:border-warning",
  info:      "focus-visible:border-info       focus-visible:ring-info/30       data-[state=checked]:border-info",
  dark:      "focus-visible:border-foreground focus-visible:ring-foreground/30 data-[state=checked]:border-foreground",
}

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

// Figma: 18px circle, border=1.5px muted (unchecked). Checked = white fill + 5px primary
// border (ring look, no separate dot) + drop-shadow. Disabled unchecked drops the border
// for a plain filled gray dot; disabled checked keeps the ring at 50% opacity.
function RadioGroupItem({
  className,
  color = "primary",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  color?: RadioColor
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer aspect-square size-[18px] shrink-0 cursor-pointer rounded-full border-[1.5px] border-muted-foreground bg-transparent outline-none transition-[color,box-shadow,background-color,border-color]",
        "focus-visible:ring-[3px]",
        "data-[state=checked]:border-[5px] data-[state=checked]:bg-card data-[state=checked]:shadow-[0px_2px_4px_rgba(165,163,174,0.3)]",
        "disabled:cursor-not-allowed",
        "disabled:data-[state=unchecked]:border-transparent disabled:data-[state=unchecked]:bg-foreground/[0.3]",
        "disabled:data-[state=checked]:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        RADIO_COLOR_CLASSES[color],
        className
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
export type { RadioColor }
