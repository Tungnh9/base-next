"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface AttachmentUpload {
  id: string
  filename: string
  sizeBytes: number
  contentType: string
  progress: number
  status: "uploading" | "success" | "error"
  url?: string
  error?: string
}

let attachmentIdCounter = 0
function nextAttachmentId() {
  attachmentIdCounter += 1
  return `attachment-${attachmentIdCounter}`
}

// No backend yet — "uploading" is a fake progress ramp that resolves to a
// session-local blob URL, mirroring the video dialog's upload tab.
export function useAttachments() {
  const [attachments, setAttachments] = useState<AttachmentUpload[]>([])
  const attachmentsRef = useRef(attachments)
  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  // Revoke any blob URLs still outstanding when the editor unmounts —
  // removeAttachment only covers explicit removal, not unmount.
  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((a) => {
        if (a.url) URL.revokeObjectURL(a.url)
      })
    }
  }, [])

  const addFile = useCallback((file: File) => {
    const id = nextAttachmentId()
    setAttachments((prev) => [
      ...prev,
      {
        id,
        filename: file.name,
        sizeBytes: file.size,
        contentType: file.type || "application/octet-stream",
        progress: 0,
        status: "uploading",
      },
    ])

    const timer = setInterval(() => {
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id && a.status === "uploading"
            ? { ...a, progress: Math.min(a.progress + 20, 90) }
            : a
        )
      )
    }, 120)

    window.setTimeout(() => {
      clearInterval(timer)
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, progress: 100, status: "success", url: URL.createObjectURL(file) }
            : a
        )
      )
    }, 600)
  }, [])

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id)
      if (removed?.url) URL.revokeObjectURL(removed.url)
      return prev.filter((a) => a.id !== id)
    })
  }, [])

  return { attachments, addFile, removeAttachment }
}
