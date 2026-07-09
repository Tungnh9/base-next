"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { SuggestionProps } from "@tiptap/suggestion"
import { cn } from "@/lib/utils"
import type { SuggestionListRef } from "../lib/suggestion-popup"
import type { SlashItem } from "./types"

interface SlashListProps extends SuggestionProps<SlashItem> {
  noResultsLabel: string
}

export const SlashList = forwardRef<SuggestionListRef, SlashListProps>(function SlashList(
  { items, command, noResultsLabel },
  ref
) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => setSelectedIndex(0), [items])

  const select = (index: number) => {
    const item = items[index]
    if (item) command(item)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i + items.length - 1) % items.length)
        return true
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % items.length)
        return true
      }
      if (event.key === "Enter") {
        select(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (items.length === 0) {
    return (
      <div className="bg-popover text-muted-foreground border-border w-60 rounded-md border p-2 text-sm shadow-md">
        {noResultsLabel}
      </div>
    )
  }

  return (
    <div className="bg-popover border-border max-h-72 w-60 overflow-y-auto rounded-md border p-1 shadow-md">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
              index === selectedIndex ? "bg-foreground/[0.08]" : "hover:bg-foreground/[0.05]"
            )}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => select(index)}
          >
            <Icon className="text-muted-foreground size-4 shrink-0" />
            {item.title}
          </button>
        )
      })}
    </div>
  )
})
