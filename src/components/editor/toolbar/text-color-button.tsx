"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Palette } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ToolbarButton } from "./toolbar-button"

// Semantic first, then neutrals, then an extended palette — mirrors a typical
// design-system swatch set rather than a plain rainbow grid. `labelKey`
// resolves through editor.color.names.* — never hardcoded, since it's shown
// as the swatch's accessible/tooltip name.
const PRESET_COLORS = [
  { labelKey: "primary", value: "#7367f0" },
  { labelKey: "success", value: "#28c76f" },
  { labelKey: "warning", value: "#ff9f43" },
  { labelKey: "danger", value: "#ea5455" },
  { labelKey: "info", value: "#00cfe8" },
  { labelKey: "black", value: "#2d2b3d" },
  { labelKey: "dark", value: "#4b4663" },
  { labelKey: "muted", value: "#7983bb" },
  { labelKey: "light", value: "#b9bbbe" },
  { labelKey: "white", value: "#ffffff" },
  { labelKey: "red", value: "#ff4757" },
  { labelKey: "pink", value: "#e84393" },
  { labelKey: "purple", value: "#9c27b0" },
  { labelKey: "indigo", value: "#5c6bc0" },
  { labelKey: "blue", value: "#2196f3" },
  { labelKey: "cyan", value: "#00bcd4" },
  { labelKey: "teal", value: "#009688" },
  { labelKey: "green", value: "#4caf50" },
  { labelKey: "lime", value: "#8bc34a" },
  { labelKey: "yellow", value: "#ffeb3b" },
  { labelKey: "amber", value: "#ffc107" },
  { labelKey: "orange", value: "#ff5722" },
  { labelKey: "brown", value: "#795548" },
  { labelKey: "gray", value: "#607d8b" },
]

interface TextColorButtonProps {
  editor: Editor
}

export function TextColorButton({ editor }: TextColorButtonProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [customHex, setCustomHex] = useState("")

  const currentColor = editor.getAttributes("textStyle").color as string | undefined

  function applyColor(color: string) {
    editor.chain().focus().setColor(color).run()
    setOpen(false)
  }

  function resetColor() {
    editor.chain().focus().unsetColor().run()
    setOpen(false)
  }

  function handleCustomApply() {
    const hex = customHex.trim()
    if (!hex) return
    applyColor(hex.startsWith("#") ? hex : `#${hex}`)
    setCustomHex("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (!o) setCustomHex("")
        setOpen(o)
      }}
    >
      <PopoverTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.textColor")} isActive={!!currentColor}>
          <span className="relative flex items-center justify-center">
            <Palette />
            <span
              aria-hidden
              className="absolute right-[3px] -bottom-[3px] left-[3px] h-[2.5px] rounded-full"
              style={{ background: currentColor ?? "currentColor" }}
            />
          </span>
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent className="w-[216px] p-3" align="start">
        <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
          {t("toolbar.textColor")}
        </p>

        <div className="mb-3 grid grid-cols-6 gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={t(`color.names.${c.labelKey}`)}
              onClick={() => applyColor(c.value)}
              className={cn(
                "border-border size-6 rounded-[4px] border transition-transform hover:scale-110 focus:outline-none",
                currentColor === c.value && "ring-primary ring-2 ring-offset-1"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs">
              #
            </span>
            <input
              type="text"
              maxLength={6}
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleCustomApply()}
              placeholder="rrggbb"
              className="border-input bg-card focus:border-primary focus:ring-ring/50 w-full rounded-[6px] border py-1.5 pr-2 pl-6 text-xs outline-none focus:ring-[3px]"
            />
          </div>
          <button
            type="button"
            onClick={handleCustomApply}
            disabled={!customHex}
            className="bg-primary rounded-[6px] px-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {tCommon("confirm")}
          </button>
        </div>

        {currentColor && (
          <button
            type="button"
            onClick={resetColor}
            className="text-muted-foreground hover:text-destructive mt-2 w-full rounded-[4px] py-1 text-xs transition-colors"
          >
            {t("color.removeColor")}
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}
