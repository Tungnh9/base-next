"use client"

import { Paperclip } from "lucide-react"
import { useTranslations } from "next-intl"
import { ToolbarButton } from "./toolbar-button"

interface AttachmentButtonProps {
  onClick: () => void
}

export function AttachmentButton({ onClick }: AttachmentButtonProps) {
  const t = useTranslations("editor")

  return (
    <ToolbarButton tooltip={t("toolbar.attachment")} onClick={onClick}>
      <Paperclip />
    </ToolbarButton>
  )
}
