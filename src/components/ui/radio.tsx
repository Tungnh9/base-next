"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

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
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer aspect-square size-[18px] shrink-0 cursor-pointer rounded-full border-[1.5px] border-muted-foreground bg-transparent outline-none transition-[color,box-shadow,background-color,border-color] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 data-[state=checked]:border-[5px] data-[state=checked]:border-primary data-[state=checked]:bg-card data-[state=checked]:shadow-[0px_2px_4px_rgba(165,163,174,0.3)] disabled:data-[state=unchecked]:border-transparent disabled:data-[state=unchecked]:bg-foreground/[0.3] disabled:data-[state=checked]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
