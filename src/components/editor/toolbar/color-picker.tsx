"use client"

import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TEXT_COLORS = [
  "#000000",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0284c7",
  "#7c3aed",
  "#db2777",
  "#64748b",
  "#ffffff",
]

const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#fed7aa",
  "#e9d5ff",
  "#fbcfe8",
  "#ccfbf1",
  "#f0f9ff",
  "#fef9c3",
]

interface ColorPickerProps {
  editor: Editor
}

export function ColorPicker({ editor }: ColorPickerProps) {
  const t = useTranslations("editor")

  const currentColor = editor.getAttributes("textStyle").color as string | undefined
  const currentHighlight = editor.getAttributes("highlight").color as string | undefined

  return (
    <div className="flex items-center gap-0.5">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-7 gap-0.5 px-1.5 text-xs">
            <span className="font-bold" style={{ color: currentColor ?? "inherit" }}>
              A
            </span>
            <div
              className="h-0.5 w-4 rounded-full"
              style={{ backgroundColor: currentColor ?? "currentColor" }}
            />
            <ChevronDown className="size-3 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <p className="text-muted-foreground mb-2 text-xs font-medium">{t("toolbar.textColor")}</p>
          <div className="grid grid-cols-5 gap-1">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "border-border size-6 rounded border transition-transform hover:scale-110 focus:outline-none",
                  currentColor === color && "ring-primary ring-2 ring-offset-1"
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (currentColor === color) {
                    editor.chain().focus().unsetColor().run()
                  } else {
                    editor.chain().focus().setColor(color).run()
                  }
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mt-2 text-xs"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            {t("color.removeColor")}
          </button>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-7 gap-0.5 px-1.5 text-xs">
            <span
              className="rounded px-0.5 font-bold"
              style={{ backgroundColor: currentHighlight ?? "transparent" }}
            >
              H
            </span>
            <ChevronDown className="size-3 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <p className="text-muted-foreground mb-2 text-xs font-medium">{t("toolbar.highlight")}</p>
          <div className="grid grid-cols-5 gap-1">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "border-border size-6 rounded border transition-transform hover:scale-110 focus:outline-none",
                  currentHighlight === color && "ring-primary ring-2 ring-offset-1"
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (currentHighlight === color) {
                    editor.chain().focus().unsetHighlight().run()
                  } else {
                    editor.chain().focus().setHighlight({ color }).run()
                  }
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mt-2 text-xs"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            {t("color.removeHighlight")}
          </button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
