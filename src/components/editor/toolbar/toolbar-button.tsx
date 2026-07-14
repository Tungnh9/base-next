"use client"

import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ToolbarButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  isActive?: boolean
  tooltip?: string
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    { onClick, isActive, disabled, tooltip, className, children, "aria-label": ariaLabel, ...rest },
    ref
  ) => {
    const button = (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel ?? tooltip}
        data-active={isActive || undefined}
        className={cn(
          "data-[active]:bg-foreground/[0.12] data-[active]:text-foreground",
          className
        )}
        {...rest}
      >
        {children}
      </Button>
    )

    if (!tooltip) return button

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }
)
ToolbarButton.displayName = "ToolbarButton"
