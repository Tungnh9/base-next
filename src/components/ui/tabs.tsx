"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// ─── Context ──────────────────────────────────────────────────────────────────

type TabsVariant = "line" | "pill"
type TabsAlign = "start" | "center" | "end"

const TabsContext = React.createContext<{ variant: TabsVariant }>({
  variant: "line",
})

// ─── Root ─────────────────────────────────────────────────────────────────────

function Tabs({
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

// ─── List ─────────────────────────────────────────────────────────────────────

function TabsList({
  className,
  variant = "line",
  align = "start",
  fullWidth = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant
  align?: TabsAlign
  fullWidth?: boolean
}) {
  const ctx = React.useMemo(() => ({ variant }), [variant])

  return (
    <TabsContext.Provider value={ctx}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          variant === "line" && [
            "flex border-b border-border",
            align === "center" && "justify-center",
            align === "end" && "justify-end",
          ],
          variant === "pill" && [
            "flex items-center gap-1 rounded-md bg-muted p-1",
            !fullWidth && "w-fit",
            align === "center" && "justify-center",
            align === "end" && "justify-end",
            fullWidth && "w-full",
          ],
          className
        )}
        {...props}
      />
    </TabsContext.Provider>
  )
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant } = React.useContext(TabsContext)

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "cursor-pointer whitespace-nowrap text-[15px] font-medium transition-colors outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "line" && [
          "relative pb-2.5 pt-2 px-1 text-muted-foreground",
          // Active underline indicator
          "data-[state=active]:text-primary",
          "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-primary after:scale-x-0 after:transition-transform",
          "data-[state=active]:after:scale-x-100",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        variant === "pill" && [
          "flex-1 rounded-[4px] px-3 py-1.5 text-muted-foreground",
          "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          "focus-visible:ring-2 focus-visible:ring-ring",
        ],
        className
      )}
      {...props}
    />
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-4 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsVariant, TabsAlign }
