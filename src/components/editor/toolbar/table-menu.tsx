"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Table as TableIcon, Rows3, Columns3 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ToolbarButton } from "./toolbar-button"

const MAX_ROWS = 8
const MAX_COLS = 8

interface TableMenuProps {
  editor: Editor
}

export function TableMenu({ editor }: TableMenuProps) {
  const t = useTranslations("editor")
  const isTableActive = editor.isActive("table")
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 })
  const [open, setOpen] = useState(false)

  function handleInsert() {
    if (hovered.rows === 0 || hovered.cols === 0) return
    editor
      .chain()
      .focus()
      .insertTable({ rows: hovered.rows, cols: hovered.cols, withHeaderRow: true })
      .run()
    setOpen(false)
    setHovered({ rows: 0, cols: 0 })
  }

  if (isTableActive) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton isActive tooltip={t("toolbar.table")}>
            <TableIcon />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()}>
            {t("table.addRowBefore")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>
            {t("table.addRowAfter")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()}>
            {t("table.deleteRow")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()}>
            {t("table.addColBefore")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>
            {t("table.addColAfter")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()}>
            {t("table.deleteCol")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!editor.can().mergeCells()}
            onSelect={() => editor.chain().focus().mergeCells().run()}
          >
            {t("table.mergeCells")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().splitCell()}
            onSelect={() => editor.chain().focus().splitCell().run()}
          >
            {t("table.splitCell")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => editor.chain().focus().deleteTable().run()}
          >
            {t("table.deleteTable")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setHovered({ rows: 0, cols: 0 })
      }}
    >
      <PopoverTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.table")}>
          <TableIcon />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}
          onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
        >
          {Array.from({ length: MAX_ROWS }, (_, r) =>
            Array.from({ length: MAX_COLS }, (_, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                aria-label={`${r + 1} × ${c + 1}`}
                className={cn(
                  "size-[26px] rounded-[5px] border transition-colors",
                  r < hovered.rows && c < hovered.cols
                    ? "border-primary/40 bg-primary/20"
                    : "border-border bg-muted/60"
                )}
                onMouseEnter={() => setHovered({ rows: r + 1, cols: c + 1 })}
                onClick={handleInsert}
              />
            ))
          )}
        </div>
        <div className="text-muted-foreground mt-2.5 flex items-center justify-center gap-1.5 text-xs">
          <Rows3 className="size-3.5" />
          <span className="w-4 text-center font-medium tabular-nums">{hovered.rows || 1}</span>
          <span className="opacity-50">×</span>
          <Columns3 className="size-3.5" />
          <span className="w-4 text-center font-medium tabular-nums">{hovered.cols || 1}</span>
        </div>
      </PopoverContent>
    </Popover>
  )
}
