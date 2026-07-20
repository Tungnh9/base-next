"use client"

import type { ComponentPropsWithoutRef } from "react"
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"

type ScrollAreaProps = ComponentPropsWithoutRef<"div">

// className is sizing-only (h-full, flex-1, min-w-0, etc.) — OverlayScrollbars
// inserts its own wrapper divs between the root and `children`, so anything
// meant to lay out the children directly (flex/gap) belongs on an element the
// caller renders inside `children`, not here.
export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <OverlayScrollbarsComponent
      className={className}
      options={{
        scrollbars: { theme: "os-theme-app", autoHide: "move", autoHideDelay: 300 },
        overflow: { x: "hidden", y: "scroll" },
      }}
      defer
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  )
}
