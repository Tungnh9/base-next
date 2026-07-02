"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, Bell, CheckCircle2, Info, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "primary" | "success" | "danger" | "warning" | "info"

// ── Provider ──────────────────────────────────────────────────────────────────
const ToastProvider = ToastPrimitives.Provider

// ── Viewport ──────────────────────────────────────────────────────────────────
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-[380px] flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// ── Root ──────────────────────────────────────────────────────────────────────
const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full flex-col overflow-hidden",
    "rounded-md border border-border bg-card text-card-foreground shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
    "data-[state=open]:animate-toast-in",
    "data-[state=closed]:animate-toast-out",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
    "data-[swipe=end]:animate-toast-out",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        success: "",
        danger: "",
        warning: "",
        info: "",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
)
Toast.displayName = ToastPrimitives.Root.displayName

// ── Header (simple notification style) ───────────────────────────────────────
const ToastHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 border-b border-border px-4 py-3", className)}
      {...props}
    />
  )
)
ToastHeader.displayName = "ToastHeader"

// ── Bell icon (simple style) ──────────────────────────────────────────────────
const ICON_COLOR: Record<ToastVariant, string> = {
  default:  "text-secondary",
  primary:  "text-primary",
  success:  "text-success",
  danger:   "text-destructive",
  warning:  "text-warning",
  info:     "text-info",
}

function ToastIcon({ variant = "default", className }: { variant?: ToastVariant; className?: string }) {
  return (
    <Bell
      aria-hidden="true"
      className={cn("size-[18px] shrink-0", ICON_COLOR[variant], className)}
    />
  )
}

// ── Title ─────────────────────────────────────────────────────────────────────
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("flex-1 text-[15px] font-semibold leading-tight text-card-foreground", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

// ── Timestamp (simple style) ──────────────────────────────────────────────────
const ToastTime = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("shrink-0 text-xs text-muted-foreground", className)} {...props} />
  )
)
ToastTime.displayName = "ToastTime"

// ── Body / description (simple style) ────────────────────────────────────────
const ToastBody = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("px-4 py-3 text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
))
ToastBody.displayName = "ToastBody"

// ── Status icon (rich style) ──────────────────────────────────────────────────
const STATUS_ICON_BG: Record<ToastVariant, string> = {
  default:  "bg-secondary/10 text-secondary",
  primary:  "bg-primary/10 text-primary",
  success:  "bg-success/10 text-success",
  danger:   "bg-destructive/10 text-destructive",
  warning:  "bg-warning/10 text-warning",
  info:     "bg-info/10 text-info",
}

const STATUS_ICONS: Record<ToastVariant, React.ReactNode> = {
  default:  <Bell className="size-4" />,
  primary:  <Bell className="size-4" />,
  success:  <CheckCircle2 className="size-4" />,
  danger:   <XCircle className="size-4" />,
  warning:  <AlertTriangle className="size-4" />,
  info:     <Info className="size-4" />,
}

function ToastStatusIcon({ variant = "default", className }: { variant?: ToastVariant; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-[26px] shrink-0 items-center justify-center rounded-[6px]",
        STATUS_ICON_BG[variant],
        className
      )}
    >
      {STATUS_ICONS[variant]}
    </span>
  )
}

// ── Description (rich style) ──────────────────────────────────────────────────
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("mt-0.5 text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// ── Actions row (rich style) ──────────────────────────────────────────────────
const ToastActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2 px-4 pb-4", className)} {...props} />
  )
)
ToastActions.displayName = "ToastActions"

// ── Primary action button ─────────────────────────────────────────────────────
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-[4px]",
      "bg-primary px-[14px] text-[13px] font-medium tracking-[0.43px] text-primary-foreground",
      "shadow-[0px_2px_4px_rgba(165,163,174,0.3)] transition-all outline-none",
      "enabled:hover:brightness-90 enabled:active:brightness-[0.85]",
      "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-65",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

// ── Cancel / secondary button ─────────────────────────────────────────────────
const ToastCancel = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-[4px]",
      "bg-muted px-[14px] text-[13px] font-medium tracking-[0.43px] text-muted-foreground",
      "transition-all hover:bg-muted/70 disabled:opacity-65",
      className
    )}
    {...props}
  />
))
ToastCancel.displayName = "ToastCancel"

// ── Close X button ────────────────────────────────────────────────────────────
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    aria-label="Close"
    className={cn(
      "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded",
      "opacity-50 transition-opacity hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="size-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastHeader,
  ToastIcon,
  ToastTitle,
  ToastTime,
  ToastBody,
  ToastStatusIcon,
  ToastDescription,
  ToastActions,
  ToastAction,
  ToastCancel,
  ToastClose,
}
export type { ToastProps, ToastActionElement }
