"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Link2, ExternalLink, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ToolbarButton } from "./toolbar-button"

interface LinkPopoverProps {
  editor: Editor
}

export function LinkPopover({ editor }: LinkPopoverProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")

  const isActive = editor.isActive("link")
  const existingHref = editor.getAttributes("link").href as string | undefined

  const handleOpenChange = (next: boolean) => {
    if (next) setUrl(existingHref ?? "")
    setOpen(next)
  }

  const handleApply = () => {
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url.trim() }).run()
    }
    setOpen(false)
  }

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <ToolbarButton isActive={isActive} tooltip={t("toolbar.link")}>
          <Link2 />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <p className="mb-3 text-sm font-semibold">{t("link.title")}</p>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleApply()
              }
              if (e.key === "Escape") setOpen(false)
            }}
            placeholder="https://example.com"
            className="border-input bg-card focus:border-primary focus:ring-ring/50 h-8 flex-1 rounded-[6px] border px-3 text-sm outline-none focus:ring-[3px]"
            autoFocus
          />
          <Button type="button" size="sm" onClick={handleApply}>
            {tCommon("confirm")}
          </Button>
        </div>
        {isActive && (
          <div className="mt-3 flex items-center gap-2">
            <a
              href={existingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-1 text-xs hover:underline"
            >
              <ExternalLink className="size-3" />
              {t("link.open")}
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="text-destructive ml-auto flex items-center gap-1 text-xs hover:underline"
            >
              <Trash2 className="size-3" />
              {t("link.remove")}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
