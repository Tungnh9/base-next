import type { JSONContent } from "@tiptap/react"
import { generateHTML } from "@tiptap/react"
import { createExtensions } from "./extensions"
import { cn } from "@/lib/utils"

export interface RichTextViewerProps {
  content: JSONContent
  className?: string
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const html = generateHTML(content, createExtensions())

  return (
    <div className={cn("prose-editor", className)} dangerouslySetInnerHTML={{ __html: html }} />
  )
}
