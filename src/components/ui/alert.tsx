"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const DEFAULT_VARIANT = "primary" as const

const alertVariants = cva(
  "flex items-start gap-3 rounded-md border px-4 py-3 text-sm [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2",
  {
    variants: {
      variant: {
        primary:   "bg-primary/10   border-primary/20   text-primary",
        secondary: "bg-secondary/10 border-secondary/20 text-secondary",
        success:   "bg-success/10   border-success/20   text-success",
        danger:    "bg-destructive/10 border-destructive/20 text-destructive",
        warning:   "bg-warning/10   border-warning/20   text-warning",
        info:      "bg-info/10      border-info/20      text-info",
        dark:      "bg-foreground/10 border-foreground/20 text-foreground",
      },
    },
    defaultVariants: {
      variant: DEFAULT_VARIANT,
    },
  }
)

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>

function Alert({
  className,
  variant = DEFAULT_VARIANT,
  icon,
  onClose,
  closeLabel = "Close",
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    icon?: React.ReactNode
    onClose?: () => void
    closeLabel?: string
  }) {
  return (
    <div
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className="mt-px shrink-0 size-[18px] flex items-center justify-center [&_svg]:size-[18px]">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="shrink-0 -mr-1 mt-px size-5 flex items-center justify-center rounded opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-title"
      className={cn("font-semibold leading-snug", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-description"
      className={cn("leading-relaxed opacity-90 [[data-slot=alert-title]+&]:mt-1", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
export type { AlertVariant }
