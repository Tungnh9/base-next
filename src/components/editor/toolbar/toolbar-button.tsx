"use client"

import { type FC } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ToolbarButtonProps {
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip?: string
  className?: string
  children: React.ReactNode
  "aria-label"?: string
}

export const ToolbarButton: FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  disabled,
  tooltip,
  className,
  children,
  "aria-label": ariaLabel,
}) => {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? tooltip}
      data-active={isActive || undefined}
      className={cn("data-[active]:bg-foreground/[0.12] data-[active]:text-foreground", className)}
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
