"use client"

import * as React from "react"
import { ChevronRight, Check } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type BreadcrumbSeparatorType = "chevron" | "slash" | "check"

const BreadcrumbContext = React.createContext<{
  separator: BreadcrumbSeparatorType
}>({ separator: "chevron" })

function Breadcrumb({
  separator = "chevron",
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  separator?: BreadcrumbSeparatorType
}) {
  return (
    <BreadcrumbContext.Provider value={{ separator }}>
      <nav
        aria-label="breadcrumb"
        data-slot="breadcrumb"
        className={cn("flex", className)}
        {...props}
      />
    </BreadcrumbContext.Provider>
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors hover:text-foreground [&_svg]:shrink-0 [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  const { separator } = React.useContext(BreadcrumbContext)

  const icon =
    children ??
    (separator === "check" ? (
      <Check className="size-3.5" />
    ) : separator === "slash" ? (
      <span aria-hidden="true">/</span>
    ) : (
      <ChevronRight className="size-3.5" />
    ))

  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("flex items-center", className)}
      {...props}
    >
      {icon}
    </li>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
export type { BreadcrumbSeparatorType }
