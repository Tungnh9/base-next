"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FileUpload } from "@/components/ui/file-upload"
import { Label } from "@/components/ui/label"

interface CustomerAvatarFieldProps {
  /** Persisted filename from the Customer record (edit mode). */
  value?: string
  onChange: (fileName: string | undefined) => void
}

// Mocked upload: no bytes ever leave the browser and nothing is stored. The
// picked File lives in local state purely to render a preview + filename;
// only the NAME is handed back to the form and persisted on the Customer
// record.
//
// State can safely live here: Radix unmounts DialogContent on close, so this
// component remounts (and its state resets) every time the dialog opens — no
// setState-in-an-effect needed to clear it.
export function CustomerAvatarField({ value, onChange }: CustomerAvatarFieldProps) {
  const t = useTranslations("customers")
  const [files, setFiles] = useState<File[]>([])

  const previewUrl = useMemo(() => (files[0] ? URL.createObjectURL(files[0]) : undefined), [files])
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  return (
    <div className="grid gap-1.5">
      <Label>{t("form.avatar")}</Label>
      <div className="flex items-start gap-4">
        <Avatar size={72} shape="rounded">
          {previewUrl && <AvatarImage src={previewUrl} alt={t("form.avatar")} />}
          <AvatarFallback color="secondary" skin="light">
            {(value ?? "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <FileUpload
          className="flex-1"
          files={files}
          onFilesChange={(next) => {
            setFiles(next)
            onChange(next[0]?.name)
          }}
          accept="image/*"
          maxFiles={1}
          title={t("form.avatarUploadTitle")}
          subtitle={t("form.avatarUploadSubtitle")}
          removeLabel={(name) => t("form.avatarRemove", { name })}
        />
      </div>
      {value && files.length === 0 && (
        <p className="text-muted-foreground text-xs">{t("form.avatarCurrent", { name: value })}</p>
      )}
    </div>
  )
}
