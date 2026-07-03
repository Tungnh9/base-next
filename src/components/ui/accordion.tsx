"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type AccordionVariant = "default" | "border" | "advance"

const AccordionContext = React.createContext<{ variant: AccordionVariant }>({ variant: "default" })

function Accordion({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & {
  variant?: AccordionVariant
}) {
  const ctx = React.useMemo(() => ({ variant }), [variant])
  return (
    <AccordionContext.Provider value={ctx}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn(
          variant === "default" && "flex flex-col gap-2",
          (variant === "border" || variant === "advance") &&
            "rounded-md border border-border bg-card divide-y divide-border overflow-hidden",
          className
        )}
        {...props}
      />
    </AccordionContext.Provider>
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { variant } = React.useContext(AccordionContext)
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group/item",
        variant === "default" && "rounded-md bg-card shadow-sm overflow-hidden",
        variant === "advance" &&
          "data-[state=open]:shadow-[inset_3px_0_0_var(--color-primary)]",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  icon,
  showIcon = true,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  icon?: React.ReactNode
  showIcon?: boolean
}) {
  const { variant } = React.useContext(AccordionContext)
  const isAdvance = variant === "advance"

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center gap-[10px] text-[15px] font-semibold text-foreground text-left transition-colors cursor-pointer hover:bg-foreground/5",
          isAdvance
            ? "group/trigger py-4 px-6 data-[state=open]:bg-foreground/8"
            : "py-[12.5px] px-[18px]",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="shrink-0 size-[18px] flex items-center justify-center text-secondary">
            {icon}
          </span>
        )}
        <span className={cn(
          "flex-1",
          isAdvance && "group-data-[state=open]/trigger:text-primary"
        )}>
          {children}
        </span>
        {showIcon && (
          <ChevronRight className="size-5 shrink-0 text-foreground transition-transform duration-200 group-data-[state=open]/item:rotate-90" />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const { variant } = React.useContext(AccordionContext)
  const isAdvance = variant === "advance"

  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        isAdvance && "data-[state=open]:bg-foreground/8",
        className
      )}
      {...props}
    >
      <div className={cn(
        "text-[15px] text-foreground",
        "pb-[12.5px]",
        isAdvance ? "px-6" : "px-[18px]"
      )}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
