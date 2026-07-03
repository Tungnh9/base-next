import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function ListGroup({
  className,
  flush = false,
  ...props
}: React.ComponentProps<"ul"> & { flush?: boolean }) {
  return (
    <ul
      role="listbox"
      data-slot="list-group"
      data-flush={flush || undefined}
      className={cn(
        "flex flex-col divide-y divide-border",
        !flush && "rounded-md border border-border overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

// ─── Item variants ────────────────────────────────────────────────────────────

const listGroupItemVariants = cva(
  "flex items-center justify-between px-5 py-3 text-[15px] leading-[22px] select-none",
  {
    variants: {
      variant: {
        default:   "",
        primary:   "bg-primary/10   text-primary",
        secondary: "bg-secondary/10 text-secondary",
        success:   "bg-success/10   text-success",
        danger:    "bg-destructive/10 text-destructive",
        warning:   "bg-warning/10   text-warning",
        info:      "bg-info/10      text-info",
        dark:      "bg-foreground/10 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

type ListGroupItemVariant = NonNullable<VariantProps<typeof listGroupItemVariants>["variant"]>

// ─── Item ─────────────────────────────────────────────────────────────────────

function ListGroupItem({
  className,
  variant = "default",
  active = false,
  disabled = false,
  children,
  ...props
}: React.ComponentProps<"li"> &
  VariantProps<typeof listGroupItemVariants> & {
    active?: boolean
    disabled?: boolean
  }) {
  return (
    <li
      role="option"
      data-slot="list-group-item"
      data-variant={variant}
      aria-disabled={disabled || undefined}
      aria-selected={active || undefined}
      className={cn(
        listGroupItemVariants({ variant }),
        // Active overrides contextual variants
        active && "bg-primary text-primary-foreground",
        // Default (no contextual variant) gets hover + cursor
        variant === "default" && !active && !disabled &&
          "cursor-pointer text-foreground hover:bg-foreground/[0.04]",
        // Hover for contextual items
        variant !== "default" && !active && !disabled &&
          "cursor-pointer hover:brightness-95",
        disabled && "opacity-50 pointer-events-none cursor-default",
        className
      )}
      {...props}
    >
      {children}
    </li>
  )
}

export { ListGroup, ListGroupItem }
export type { ListGroupItemVariant }
