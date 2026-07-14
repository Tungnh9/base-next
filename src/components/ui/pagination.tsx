import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

// ─── Context ──────────────────────────────────────────────────────────────────

type PaginationSize = "sm" | "default" | "lg"

const PaginationContext = React.createContext<{ size: PaginationSize }>({
  size: "default",
})

// ─── Size map ─────────────────────────────────────────────────────────────────

const SIZE = {
  sm: {
    // Square icon / number button
    tile: "h-7 min-w-7 rounded-[4px] px-[6px] text-[13px]",
    // Text-labeled Previous / Next button
    nav:  "h-7 rounded-[4px] px-3 text-[13px]",
    icon: "size-3.5" as const,
    gap:  "gap-1" as const,
  },
  default: {
    tile: "h-[38px] min-w-[38px] rounded-[6px] px-3 text-[15px]",
    nav:  "h-[38px] rounded-[6px] px-5 text-[15px]",
    icon: "size-4" as const,
    gap:  "gap-1.5" as const,
  },
  lg: {
    tile: "h-12 min-w-12 rounded-[8px] px-4 text-[17px]",
    nav:  "h-12 rounded-[8px] px-[26px] text-[17px]",
    icon: "size-[18px]" as const,
    gap:  "gap-2" as const,
  },
}

// ─── Shared class tokens ───────────────────────────────────────────────────────

const BASE =
  "inline-flex items-center justify-center font-medium tracking-[0.43px] whitespace-nowrap select-none transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

const INACTIVE = "bg-muted text-foreground hover:bg-accent cursor-pointer"
const ACTIVE   = "bg-primary text-primary-foreground shadow-[0px_2px_4px_rgba(165,163,174,0.3)] dark:shadow-none"
const DISABLED = "cursor-not-allowed opacity-50"

// ─── Root ─────────────────────────────────────────────────────────────────────

function Pagination({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"nav"> & { size?: PaginationSize }) {
  // Memoize so consumers don't re-render on every unrelated parent re-render
  const ctx = React.useMemo(() => ({ size }), [size])
  return (
    <PaginationContext.Provider value={ctx}>
      {/* <nav> already carries implicit role="navigation" — no need to repeat */}
      <nav
        aria-label="pagination"
        data-slot="pagination"
        className={cn("flex w-full", className)}
        {...props}
      />
    </PaginationContext.Provider>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  const { size } = React.useContext(PaginationContext)
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center", SIZE[size].gap, className)}
      {...props}
    />
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="pagination-item" className={cn("list-none", className)} {...props} />
  )
}

// ─── Link (page number or custom page) ────────────────────────────────────────

function PaginationLink({
  className,
  isActive = false,
  disabled = false,
  onClick,
  ...props
}: React.ComponentProps<"a"> & {
  isActive?: boolean
  disabled?: boolean
}) {
  const { size } = React.useContext(PaginationContext)
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      data-slot="pagination-link"
      className={cn(
        BASE,
        SIZE[size].tile,
        isActive ? ACTIVE : INACTIVE,
        disabled && DISABLED,
        // Suppress hover bg change when disabled — pointer events are active so hover fires
        disabled && !isActive && "hover:bg-muted",
        className
      )}
      {...props}
      // Placed after spread so disabled always wins; prevents keyboard Enter navigation too
      onClick={disabled ? (e) => e.preventDefault() : onClick}
    />
  )
}

// ─── Previous ─────────────────────────────────────────────────────────────────

function PaginationPrevious({
  className,
  label,
  disabled = false,
  onClick,
  ...props
}: React.ComponentProps<"a"> & {
  label?: string
  disabled?: boolean
}) {
  const { size } = React.useContext(PaginationContext)
  const sz = SIZE[size]
  return (
    <a
      aria-label={label ? undefined : "Go to previous page"}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      data-slot="pagination-previous"
      className={cn(
        BASE,
        label ? sz.nav : sz.tile,
        INACTIVE,
        disabled && DISABLED,
        disabled && "hover:bg-muted",
        className
      )}
      {...props}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
    >
      {/* Use || not ?? so empty string also falls back to the icon */}
      {label || <ChevronLeft className={sz.icon} />}
    </a>
  )
}

// ─── Next ─────────────────────────────────────────────────────────────────────

function PaginationNext({
  className,
  label,
  disabled = false,
  onClick,
  ...props
}: React.ComponentProps<"a"> & {
  label?: string
  disabled?: boolean
}) {
  const { size } = React.useContext(PaginationContext)
  const sz = SIZE[size]
  return (
    <a
      aria-label={label ? undefined : "Go to next page"}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      data-slot="pagination-next"
      className={cn(
        BASE,
        label ? sz.nav : sz.tile,
        INACTIVE,
        disabled && DISABLED,
        disabled && "hover:bg-muted",
        className
      )}
      {...props}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
    >
      {label || <ChevronRight className={sz.icon} />}
    </a>
  )
}

// ─── Ellipsis ─────────────────────────────────────────────────────────────────

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  const { size } = React.useContext(PaginationContext)
  const sz = SIZE[size]
  return (
    // role="img" + aria-label exposes the label to AT; sr-only inside aria-hidden is unreachable
    <span
      role="img"
      aria-label="More pages"
      data-slot="pagination-ellipsis"
      className={cn(
        "inline-flex items-center justify-center text-muted-foreground",
        sz.tile,
        className
      )}
      {...props}
    >
      <MoreHorizontal aria-hidden className={sz.icon} />
    </span>
  )
}

// ─── Exports ───────────────────────────────────────────────────────────────────

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
