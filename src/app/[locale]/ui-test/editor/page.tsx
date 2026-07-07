"use client"

import { useState } from "react"
import type { JSONContent } from "@tiptap/react"
import { RichTextEditor } from "@/components/editor"
import { RichTextViewer } from "@/components/editor"

export default function EditorPage() {
  const [content, setContent] = useState<JSONContent | undefined>(undefined)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Rich Text Editor</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          WYSIWYG editor với TipTap v2 — output JSON
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Editor</p>
        <RichTextEditor
          placeholder="Bắt đầu viết nội dung..."
          onChange={setContent}
          showCharacterCount
          minHeight={300}
        />
      </div>

      {content && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Preview (RichTextViewer)</p>
          <div className="border-border bg-card rounded-[6px] border p-4">
            <RichTextViewer content={content} />
          </div>
        </div>
      )}

      {content && (
        <details className="group">
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium select-none">
            JSON output ▾
          </summary>
          <pre className="border-border bg-muted mt-2 overflow-auto rounded-[6px] border p-4 text-xs leading-relaxed">
            {JSON.stringify(content, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
