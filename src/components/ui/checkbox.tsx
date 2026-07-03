"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type CheckboxColor = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark"

const CHECKBOX_COLOR_CLASSES: Record<CheckboxColor, string> = {
  primary:
    "focus-visible:border-primary    focus-visible:ring-primary/30    data-[state=checked]:border-primary    data-[state=checked]:bg-primary    data-[state=indeterminate]:border-primary    data-[state=indeterminate]:bg-primary",
  secondary:
    "focus-visible:border-secondary  focus-visible:ring-secondary/30  data-[state=checked]:border-secondary  data-[state=checked]:bg-secondary  data-[state=indeterminate]:border-secondary  data-[state=indeterminate]:bg-secondary",
  success:
    "focus-visible:border-success    focus-visible:ring-success/30    data-[state=checked]:border-success    data-[state=checked]:bg-success    data-[state=indeterminate]:border-success    data-[state=indeterminate]:bg-success",
  danger:
    "focus-visible:border-destructive focus-visible:ring-destructive/30 data-[state=checked]:border-destructive data-[state=checked]:bg-destructive data-[state=indeterminate]:border-destructive data-[state=indeterminate]:bg-destructive",
  warning:
    "focus-visible:border-warning    focus-visible:ring-warning/30    data-[state=checked]:border-warning    data-[state=checked]:bg-warning    data-[state=indeterminate]:border-warning    data-[state=indeterminate]:bg-warning",
  info:
    "focus-visible:border-info       focus-visible:ring-info/30       data-[state=checked]:border-info       data-[state=checked]:bg-info       data-[state=indeterminate]:border-info       data-[state=indeterminate]:bg-info",
  dark:
    "focus-visible:border-foreground focus-visible:ring-foreground/30 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=indeterminate]:border-foreground data-[state=indeterminate]:bg-foreground",
}

function Checkbox({
  className,
  color = "primary",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  color?: CheckboxColor
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer size-[18px] shrink-0 cursor-pointer rounded-[4px] border-[1.5px] border-muted-foreground bg-transparent outline-none transition-[color,box-shadow,background-color,border-color]",
        "focus-visible:ring-[3px]",
        "data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-[0px_2px_2px_rgba(165,163,174,0.3)]",
        "data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:shadow-[0px_2px_2px_rgba(165,163,174,0.3)]",
        "disabled:cursor-not-allowed disabled:shadow-none",
        "disabled:data-[state=unchecked]:border-transparent disabled:data-[state=unchecked]:bg-foreground/[0.4]",
        "disabled:data-[state=checked]:opacity-50 disabled:data-[state=indeterminate]:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        CHECKBOX_COLOR_CLASSES[color],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 group-data-[state=indeterminate]:hidden" />
        <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
export type { CheckboxColor }
