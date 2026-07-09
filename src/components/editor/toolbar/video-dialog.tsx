"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Video as VideoIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ToolbarButton } from "./toolbar-button"
import { parseVideoUrl } from "../video/parse-video-url"

interface VideoDialogProps {
  editor: Editor
}

export function VideoDialog({ editor }: VideoDialogProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")

  const [open, setOpen] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setOpen(false)
    setUrlInput("")
    setError(null)
  }

  const handleInsert = () => {
    const parsed = parseVideoUrl(urlInput)
    if (!parsed) {
      setError(t("video.invalidUrl"))
      return
    }
    editor.chain().focus().setVideo({ src: parsed.embedUrl, provider: parsed.provider }).run()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.video")}>
          <VideoIcon />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("video.title")}</DialogTitle>
        </DialogHeader>
        <input
          type="url"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleInsert()
          }}
          placeholder={t("video.urlPlaceholder")}
          className="border-input bg-card focus:border-primary focus:ring-ring/50 h-[38px] w-full rounded-[6px] border px-3 text-[15px] outline-none focus:ring-[3px]"
          autoFocus
        />
        {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            {tCommon("cancel")}
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!urlInput.trim()}>
            {t("video.insertBtn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
