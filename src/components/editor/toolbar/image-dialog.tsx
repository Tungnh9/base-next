"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { ImageIcon, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ToolbarButton } from "./toolbar-button"

interface ImageDialogProps {
  editor: Editor
}

export function ImageDialog({ editor }: ImageDialogProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")

  const [open, setOpen] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleClose = () => {
    setOpen(false)
    setUrlInput("")
    setFiles([])
    setUploadError(null)
  }

  const insertImageUrl = (src: string) => {
    editor.chain().focus().setImage({ src }).run()
    handleClose()
  }

  const handleUrlInsert = () => {
    if (!urlInput.trim()) return
    insertImageUrl(urlInput.trim())
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append("file", files[0])
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error(t("image.uploadError"))
      const data = (await res.json()) as { url: string }
      insertImageUrl(data.url)
    } catch {
      setUploadError(t("image.uploadError"))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.image")}>
          <ImageIcon />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("image.title")}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload">
          <TabsList variant="pill">
            <TabsTrigger value="upload">{t("image.uploadTab")}</TabsTrigger>
            <TabsTrigger value="url">{t("image.urlTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              accept="image/*"
              title={t("image.uploadTitle")}
              subtitle={t("image.uploadSubtitle")}
            />
            {uploadError && <p className="text-destructive mt-2 text-sm">{uploadError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" />
                    {t("image.uploading")}
                  </>
                ) : (
                  t("image.insertBtn")
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="url">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUrlInsert()
              }}
              placeholder={t("image.urlPlaceholder")}
              className="border-input bg-card focus:border-primary focus:ring-ring/50 h-[38px] w-full rounded-[6px] border px-3 text-[15px] outline-none focus:ring-[3px]"
              autoFocus
            />
            {urlInput && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlInput}
                alt="preview"
                className="border-border mt-3 max-h-40 w-full rounded-[6px] border object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
                onLoad={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "block"
                }}
              />
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {tCommon("cancel")}
              </Button>
              <Button type="button" onClick={handleUrlInsert} disabled={!urlInput.trim()}>
                {t("image.insertBtn")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
