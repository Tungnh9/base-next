"use client"

import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Table as TableIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToolbarButton } from "./toolbar-button"

interface TableMenuProps {
  editor: Editor
}

export function TableMenu({ editor }: TableMenuProps) {
  const t = useTranslations("editor")
  const isTableActive = editor.isActive("table")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton isActive={isTableActive} tooltip={t("toolbar.table")}>
          <TableIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {!isTableActive ? (
          <DropdownMenuItem
            onSelect={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            {t("table.insert")}
          </DropdownMenuItem>
        ) : (
          <>
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
            <DropdownMenuItem onSelect={() => editor.chain().focus().mergeCells().run()}>
              {t("table.mergeCells")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().splitCell().run()}>
              {t("table.splitCell")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => editor.chain().focus().deleteTable().run()}
            >
              {t("table.deleteTable")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
