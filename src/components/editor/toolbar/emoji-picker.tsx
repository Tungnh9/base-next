"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Smile } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToolbarButton } from "./toolbar-button"

// @emoji-mart/react touches the DOM at import time — load client-only, and defer
// its (fairly large) emoji dataset until the picker actually opens.
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false })

interface EmojiSelection {
  native?: string
}

interface EmojiPickerProps {
  editor: Editor
}

export function EmojiPicker({ editor }: EmojiPickerProps) {
  const t = useTranslations("editor")
  const [open, setOpen] = useState(false)

  function handleSelect(emoji: EmojiSelection) {
    if (emoji.native) {
      editor.chain().focus().insertContent(emoji.native).run()
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.emoji")}>
          <Smile />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {open && (
          <Picker
            data={() => import("@emoji-mart/data").then((mod) => mod.default)}
            onEmojiSelect={handleSelect}
            theme="light"
            previewPosition="none"
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
