"use client"

import * as React from "react"
import { File as FileIcon, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`
}

type FileUploadProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  files: File[]
  onFilesChange: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxFiles?: number
  disabled?: boolean
  title?: string
  subtitle?: string
  removeLabel?: (fileName: string) => string
  "aria-invalid"?: boolean
  id?: string
  name?: string
}

// Figma "File Upload": 800x300 dashed dropzone, rounded-[6px] border-border, icon in a
// bg-foreground/8% rounded-[6px] chip, title 22px/30px semibold, subtitle 15px/22px text-body.
function FileUpload({
  className,
  files,
  onFilesChange,
  multiple = false,
  accept,
  maxFiles,
  disabled,
  title,
  subtitle,
  removeLabel,
  id,
  name,
  "aria-invalid": ariaInvalid,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Reset drag highlight when the pointer leaves the browser window mid-drag
  // (onDragLeave on the div doesn't fire when exiting to the OS/taskbar).
  React.useEffect(() => {
    if (!isDragging) return
    const reset = (e: DragEvent) => {
      if (!e.relatedTarget) setIsDragging(false)
    }
    window.addEventListener("dragleave", reset)
    return () => window.removeEventListener("dragleave", reset)
  }, [isDragging])

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return
    const incomingFiles = Array.from(incoming)

    if (!multiple) {
      onFilesChange(incomingFiles.slice(0, 1))
      return
    }

    const merged = [...files, ...incomingFiles]
    onFilesChange(maxFiles != null ? merged.slice(0, maxFiles) : merged)
  }

  const openFileDialog = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openFileDialog()
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // Ignore events caused by crossing into a child element — only reset when
    // the pointer genuinely exits the component boundary.
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return
    addFiles(event.dataTransfer.files)
  }

  const handleRemove = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-invalid={ariaInvalid}
        data-invalid={ariaInvalid || undefined}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !isDragging) setIsDragging(true)
        }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-border flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[6px] border border-dashed px-6 py-10 text-center transition-colors outline-none",
          "focus-visible:border-primary focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40 data-[invalid=true]:ring-[3px]",
          isDragging && "border-primary bg-primary/[0.04]",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="bg-foreground/[0.08] flex shrink-0 items-center justify-center rounded-[6px] p-[10px]">
          <Upload className="text-foreground size-7" strokeWidth={1.5} />
        </span>
        {(title || subtitle) && (
          <div className="flex flex-col gap-1">
            {title && (
              <p className="text-foreground text-[22px] leading-[30px] font-semibold">{title}</p>
            )}
            {subtitle && <p className="text-text-body text-[15px] leading-[22px]">{subtitle}</p>}
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ""
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className="border-border bg-card flex items-center justify-between gap-3 rounded-[6px] border px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-foreground/[0.08] flex shrink-0 items-center justify-center rounded-[6px] p-2">
                  <FileIcon className="text-foreground size-4" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-foreground truncate text-[14px] font-medium">
                    {file.name}
                  </span>
                  <span className="text-muted-foreground text-[13px]">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                aria-label={removeLabel?.(file.name)}
                className="text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground shrink-0 rounded-[4px] p-1.5 transition-colors outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileUpload }
export type { FileUploadProps }
