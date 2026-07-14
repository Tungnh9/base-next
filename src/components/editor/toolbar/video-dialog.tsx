"use client"

import { useRef, useState } from "react"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { Video as VideoIcon, CheckCircle2, Loader2 } from "lucide-react"
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
import { parseVideoUrl } from "../video/parse-video-url"

interface VideoDialogProps {
  editor: Editor
}

interface UploadState {
  status: "idle" | "uploading" | "done" | "error"
  progress: number
  result?: { url: string; filename: string }
  error?: string
}

const IDLE_UPLOAD: UploadState = { status: "idle", progress: 0 }

export function VideoDialog({ editor }: VideoDialogProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")

  const [open, setOpen] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [urlError, setUrlError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [uploadState, setUploadState] = useState<UploadState>(IDLE_UPLOAD)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const parsed = parseVideoUrl(urlInput)

  function stopProgressTimer() {
    if (progressTimer.current) {
      clearInterval(progressTimer.current)
      progressTimer.current = null
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      stopProgressTimer()
      if (uploadState.status === "done" && uploadState.result) {
        URL.revokeObjectURL(uploadState.result.url)
      }
      setUrlInput("")
      setUrlError(null)
      setFiles([])
      setUploadState(IDLE_UPLOAD)
    }
    setOpen(next)
  }

  // Insert flows close the dialog without discarding the just-inserted blob
  // URL (it's now referenced by the editor content), so they bypass the
  // revoke-on-close in handleOpenChange.
  function closeAfterInsert() {
    stopProgressTimer()
    setOpen(false)
    setUrlInput("")
    setUrlError(null)
    setFiles([])
    setUploadState(IDLE_UPLOAD)
  }

  // No backend yet — simulate an upload with a fake progress ramp, then hand
  // back a session-local blob URL (matches the "no uploadConfig" fallback).
  function handleFilesChange(next: File[]) {
    setFiles(next)
    stopProgressTimer()
    if (uploadState.status === "done" && uploadState.result) {
      URL.revokeObjectURL(uploadState.result.url)
    }

    const file = next[0]
    if (!file) {
      setUploadState(IDLE_UPLOAD)
      return
    }
    if (!file.type.startsWith("video/")) {
      setUploadState({ status: "error", progress: 0, error: t("video.uploadInvalidType") })
      return
    }

    setUploadState({ status: "uploading", progress: 0 })
    progressTimer.current = setInterval(() => {
      setUploadState((s) =>
        s.status === "uploading" ? { ...s, progress: Math.min(s.progress + 20, 90) } : s
      )
    }, 120)

    window.setTimeout(() => {
      stopProgressTimer()
      setUploadState({
        status: "done",
        progress: 100,
        result: { url: URL.createObjectURL(file), filename: file.name },
      })
    }, 600)
  }

  function handleInsertUrl() {
    if (!parsed) {
      setUrlError(t("video.invalidUrl"))
      return
    }
    editor.chain().focus().setVideo({ src: parsed.embedUrl, provider: parsed.provider }).run()
    closeAfterInsert()
  }

  function handleInsertUpload() {
    if (uploadState.status !== "done" || !uploadState.result) return
    editor.chain().focus().setVideo({ src: uploadState.result.url, provider: "file" }).run()
    closeAfterInsert()
  }

  const providerLabel =
    parsed?.provider === "file"
      ? t("video.providerFile")
      : parsed?.provider === "youtube"
        ? "YouTube"
        : "Vimeo"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.video")}>
          <VideoIcon />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="border-border border-b py-4">
          <DialogTitle>{t("video.title")}</DialogTitle>
        </DialogHeader>
        <div className="px-6 pt-5 pb-6">
          <Tabs defaultValue="url" onValueChange={() => setUrlError(null)}>
            <TabsList variant="pill" fullWidth>
              <TabsTrigger value="url">{t("video.urlTab")}</TabsTrigger>
              <TabsTrigger value="upload">{t("video.uploadTab")}</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-3">
              <div>
                <input
                  autoFocus
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value)
                    setUrlError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInsertUrl()
                  }}
                  placeholder={t("video.urlPlaceholder")}
                  className="border-input bg-card focus:border-primary focus:ring-ring/50 h-[38px] w-full rounded-[6px] border px-3 text-[15px] outline-none focus:ring-[3px]"
                />
                <p className="text-muted-foreground mt-1.5 text-xs">{t("video.urlHint")}</p>
              </div>

              {parsed && (
                <div className="border-success/30 bg-success/10 flex items-center gap-2 rounded-[6px] border px-3 py-2">
                  <CheckCircle2 className="text-success size-3.5 shrink-0" />
                  <span className="text-success text-xs">
                    {t("video.recognizedAs", { provider: providerLabel })}
                  </span>
                </div>
              )}

              {parsed && (
                <div className="aspect-video overflow-hidden rounded-[8px] bg-black">
                  {parsed.provider === "file" ? (
                    <video
                      key={parsed.embedUrl}
                      src={parsed.embedUrl}
                      controls
                      preload="metadata"
                      className="size-full"
                    />
                  ) : (
                    <iframe
                      key={parsed.embedUrl}
                      src={parsed.embedUrl}
                      className="size-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={t("video.previewTitle")}
                    />
                  )}
                </div>
              )}

              {urlError && <p className="text-destructive text-sm">{urlError}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button type="button" onClick={handleInsertUrl} disabled={!parsed}>
                  {t("video.insertBtn")}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-3">
              {uploadState.status === "uploading" ? (
                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="text-primary size-4 animate-spin" />
                    <span className="text-sm">{t("video.uploading")}</span>
                    <span className="text-primary ml-auto text-xs font-semibold">
                      {uploadState.progress}%
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-150"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                </div>
              ) : uploadState.status === "done" && uploadState.result ? (
                <div className="border-success/30 bg-success/10 flex items-center gap-3 rounded-[8px] border px-4 py-3">
                  <CheckCircle2 className="text-success size-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t("video.uploadSuccess")}</p>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {uploadState.result.filename}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFilesChange([])}
                    className="text-muted-foreground hover:text-destructive shrink-0 text-xs transition-colors"
                  >
                    {t("video.changeFile")}
                  </button>
                </div>
              ) : (
                <>
                  <FileUpload
                    files={files}
                    onFilesChange={handleFilesChange}
                    accept="video/*"
                    title={t("video.dropzoneTitle")}
                    subtitle={t("video.dropzoneHint")}
                  />
                  {uploadState.status === "error" && (
                    <p className="text-destructive text-sm">{uploadState.error}</p>
                  )}
                </>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleInsertUpload}
                  disabled={uploadState.status !== "done"}
                >
                  {t("video.insertBtn")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
