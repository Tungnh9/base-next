"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Loader2 } from "lucide-react"
import type { SuggestionProps } from "@tiptap/suggestion"
import { cn } from "@/lib/utils"
import type { SuggestionListRef } from "../lib/suggestion-popup"
import type { MentionItem } from "./types"

interface MentionListProps extends SuggestionProps<MentionItem> {
  noResultsLabel: string
  groupLabel: string
  loadingLabel: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const MentionList = forwardRef<SuggestionListRef, MentionListProps>(function MentionList(
  { items, command, noResultsLabel, groupLabel, loadingLabel, loading },
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

  return (
    <div className="bg-popover border-border max-h-64 w-60 overflow-y-auto rounded-md border p-1.5 shadow-md">
      <p className="text-muted-foreground mb-1 px-3 text-[10px] font-semibold tracking-wider uppercase">
        {groupLabel}
      </p>

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-xs">
          <Loader2 className="size-3.5 animate-spin" />
          {loadingLabel}
        </div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground px-3 py-3 text-xs">{noResultsLabel}</div>
      ) : (
        items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-left transition-colors",
              index === selectedIndex ? "bg-primary/16 text-primary" : "hover:bg-foreground/[0.05]"
            )}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => select(index)}
          >
            {item.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- suggestion popup renders outside Next's tree
              <img
                src={item.avatarUrl}
                alt={item.label}
                className="size-7 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="bg-primary/16 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                {getInitials(item.label)}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-none font-medium">
                {item.label}
              </span>
              {item.email && (
                <span className="text-muted-foreground mt-0.5 block truncate text-[11px] leading-none">
                  {item.email}
                </span>
              )}
            </span>
          </button>
        ))
      )}
    </div>
  )
})
