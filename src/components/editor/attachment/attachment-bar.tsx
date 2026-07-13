"use client"

import {
  File,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { AttachmentUpload } from "./use-attachments"

function FileTypeIcon({ contentType, className }: { contentType: string; className?: string }) {
  const cls = cn("size-4 shrink-0", className)
  if (contentType.startsWith("image/")) return <FileImage className={cls} />
  if (contentType.startsWith("video/")) return <FileVideo className={cls} />
  if (contentType.startsWith("audio/")) return <FileAudio className={cls} />
  if (contentType === "application/pdf") return <FileText className={cls} />
  if (contentType.includes("zip") || contentType.includes("archive"))
    return <FileArchive className={cls} />
  return <File className={cls} />
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface AttachmentBarProps {
  attachments: AttachmentUpload[]
  onRemove: (id: string) => void
}

export function AttachmentBar({ attachments, onRemove }: AttachmentBarProps) {
  const t = useTranslations("editor")

  if (attachments.length === 0) return null

  return (
    <div className="border-border bg-muted/40 border-t px-3 py-2">
      <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
        {t("attachment.title")}
      </p>
      <div className="flex flex-col gap-1.5">
        {attachments.map((a) => (
          <div
            key={a.id}
            className={cn(
              "bg-card flex items-center gap-2.5 rounded-[6px] border px-2.5 py-2",
              a.status === "error" ? "border-destructive/40" : "border-border"
            )}
          >
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-[4px]",
                a.status === "error"
                  ? "bg-destructive/16 text-destructive"
                  : "bg-primary/16 text-primary"
              )}
            >
              <FileTypeIcon contentType={a.contentType} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{a.filename}</p>
              {a.status === "success" && (
                <p className="text-muted-foreground text-[11px]">{formatSize(a.sizeBytes)}</p>
              )}
              {a.status === "uploading" && (
                <div className="bg-border mt-1 h-[3px] w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-200"
                    style={{ width: `${a.progress}%` }}
                  />
                </div>
              )}
              {a.status === "error" && a.error && (
                <p className="text-destructive text-[11px]">{a.error}</p>
              )}
            </div>
            <div className="shrink-0">
              {a.status === "uploading" && (
                <Loader2 className="text-primary size-3.5 animate-spin" />
              )}
              {a.status === "success" && <CheckCircle className="text-success size-3.5" />}
              {a.status === "error" && <XCircle className="text-destructive size-3.5" />}
            </div>
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              aria-label={t("attachment.remove")}
              className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
