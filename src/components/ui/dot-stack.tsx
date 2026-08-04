"use client"

import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { COLOR_VARIANTS, type ColorVariant } from "@/components/ui/color-variants"

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>

// Button uses "default"/"destructive" for what ColorVariant calls
// "primary"/"danger" — everything else lines up 1:1.
const COLOR_TO_BUTTON_VARIANT: Record<ColorVariant, ButtonVariant> = {
  primary: "default",
  secondary: "secondary",
  success: "success",
  danger: "destructive",
  warning: "warning",
  info: "info",
  dark: "dark",
}

interface DotStackProps {
  value: ColorVariant
  onChange?: (color: ColorVariant) => void
  className?: string
}

function DotStack({ value, onChange, className }: DotStackProps) {
  const interactive = Boolean(onChange)

  return (
    <div
      role={interactive ? "radiogroup" : undefined}
      className={cn("flex items-center gap-1", className)}
    >
      {COLOR_VARIANTS.map((color) => {
        const selected = color === value
        return (
          <Button
            key={color}
            type="button"
            variant={COLOR_TO_BUTTON_VARIANT[color]}
            size="icon-xs"
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? selected : undefined}
            aria-label={color}
            tabIndex={interactive ? undefined : -1}
            onClick={interactive ? () => onChange?.(color) : undefined}
            className={cn(
              "size-3.5 min-w-0 rounded-full p-0 shadow-none",
              selected && "ring-foreground/70 ring-offset-background ring-2 ring-offset-1",
              !interactive && "pointer-events-none"
            )}
          />
        )
      })}
    </div>
  )
}

export { DotStack }
export type { DotStackProps }
