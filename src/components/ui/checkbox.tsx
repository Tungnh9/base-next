"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Figma: 18px box, radius=4px, border=1.5px #b7b5be (unchecked) / bg-primary + drop-shadow
// (checked, indeterminate). Disabled unchecked drops the border for a plain filled gray box
// (foreground @ 40% opacity); disabled checked/indeterminate keep the fill at 50% opacity, no shadow.
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer size-[18px] shrink-0 cursor-pointer rounded-[4px] border-[1.5px] border-muted-foreground bg-transparent outline-none transition-[color,box-shadow,background-color] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-[0px_2px_2px_rgba(165,163,174,0.3)] data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:shadow-[0px_2px_2px_rgba(165,163,174,0.3)] disabled:data-[state=unchecked]:border-transparent disabled:data-[state=unchecked]:bg-foreground/[0.4] disabled:data-[state=checked]:opacity-50 disabled:data-[state=indeterminate]:opacity-50",
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
