"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { SuggestionProps } from "@tiptap/suggestion"
import { cn } from "@/lib/utils"
import type { SuggestionListRef } from "../lib/suggestion-popup"
import type { SlashGroupLabels } from "./slash-command"
import type { SlashGroup, SlashItem } from "./types"

interface SlashListProps extends SuggestionProps<SlashItem> {
  noResultsLabel: string
  groupLabels: SlashGroupLabels
}

const GROUP_ORDER: SlashGroup[] = ["text", "heading", "list", "block", "media"]

export const SlashList = forwardRef<SuggestionListRef, SlashListProps>(function SlashList(
  { items, command, noResultsLabel, groupLabels },
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
      <div className="bg-popover text-muted-foreground border-border w-64 rounded-md border p-2 text-sm shadow-md">
        {noResultsLabel}
      </div>
    )
  }

  return (
    <div className="bg-popover border-border max-h-80 w-64 overflow-y-auto rounded-md border p-1.5 shadow-md">
      {GROUP_ORDER.map((group) => {
        const groupItems = items.filter((item) => item.group === group)
        if (groupItems.length === 0) return null

        return (
          <div key={group}>
            <p className="text-muted-foreground mt-1 mb-1 px-3 text-[10px] font-semibold tracking-wider uppercase first:mt-0">
              {groupLabels[group]}
            </p>
            {groupItems.map((item) => {
              const index = items.indexOf(item)
              const isSelected = index === selectedIndex
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left transition-colors",
                    isSelected ? "bg-primary/16 text-primary" : "hover:bg-foreground/[0.05]"
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => select(index)}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-[6px]",
                      isSelected ? "bg-primary/24 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-none font-medium">{item.title}</span>
                    <span className="text-muted-foreground mt-0.5 block truncate text-[11px] leading-none">
                      {item.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
})
