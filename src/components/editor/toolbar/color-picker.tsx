"use client"

import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Highlighter } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ToolbarButton } from "./toolbar-button"

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

  const currentHighlight = editor.getAttributes("highlight").color as string | undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.highlight")} isActive={!!currentHighlight}>
          <span className="relative flex items-center justify-center">
            <Highlighter />
            <span
              aria-hidden
              className="absolute right-[3px] -bottom-[3px] left-[3px] h-[2.5px] rounded-full"
              style={{ background: currentHighlight ?? "currentColor" }}
            />
          </span>
        </ToolbarButton>
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
  )
}
