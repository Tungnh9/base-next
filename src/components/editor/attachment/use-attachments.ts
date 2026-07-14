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

interface PendingTimers {
  interval: NodeJS.Timeout
  timeout: number
}

// No backend yet — "uploading" is a fake progress ramp that resolves to a
// session-local blob URL, mirroring the video dialog's upload tab.
export function useAttachments() {
  const [attachments, setAttachments] = useState<AttachmentUpload[]>([])
  const attachmentsRef = useRef(attachments)
  const pendingTimersRef = useRef<Map<string, PendingTimers>>(new Map())

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  // On unmount: cancel in-flight timers (prevents post-unmount blob creation)
  // then revoke any blob URLs that were already stored.
  useEffect(() => {
    return () => {
      pendingTimersRef.current.forEach(({ interval, timeout }) => {
        clearInterval(interval)
        clearTimeout(timeout)
      })
      pendingTimersRef.current.clear()
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

    const interval = setInterval(() => {
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id && a.status === "uploading"
            ? { ...a, progress: Math.min(a.progress + 20, 90) }
            : a
        )
      )
    }, 120)

    const timeout = window.setTimeout(() => {
      clearInterval(interval)
      pendingTimersRef.current.delete(id)
      const blobUrl = URL.createObjectURL(file)
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, progress: 100, status: "success", url: blobUrl } : a
        )
      )
    }, 600)

    pendingTimersRef.current.set(id, { interval, timeout })
  }, [])

  const removeAttachment = useCallback((id: string) => {
    // Cancel in-flight timers for this attachment (if still uploading)
    const timers = pendingTimersRef.current.get(id)
    if (timers) {
      clearInterval(timers.interval)
      clearTimeout(timers.timeout)
      pendingTimersRef.current.delete(id)
    }
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id)
      if (removed?.url) URL.revokeObjectURL(removed.url)
      return prev.filter((a) => a.id !== id)
    })
  }, [])

  return { attachments, addFile, removeAttachment }
}
