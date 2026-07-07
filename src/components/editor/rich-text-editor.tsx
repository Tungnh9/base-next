"use client"

import { useMemo, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { createExtensions } from "./extensions"
import { EditorToolbar } from "./toolbar/editor-toolbar"
import { cn } from "@/lib/utils"

export interface RichTextEditorProps {
  value?: JSONContent
  defaultValue?: JSONContent
  onChange?: (json: JSONContent) => void
  placeholder?: string
  editable?: boolean
  className?: string
  minHeight?: number
  maxHeight?: number
  showCharacterCount?: boolean
  maxCharacters?: number
}

export function RichTextEditor({
  value,
  defaultValue,
  onChange,
  placeholder,
  editable = true,
  className,
  minHeight = 200,
  maxHeight,
  showCharacterCount = false,
  maxCharacters,
}: RichTextEditorProps) {
  const t = useTranslations("editor")
  const resolvedPlaceholder = placeholder ?? t("placeholder")

  const extensions = useMemo(
    () => createExtensions({ placeholder: resolvedPlaceholder, maxCharacters }),
    [resolvedPlaceholder, maxCharacters]
  )

  const editor = useEditor({
    extensions,
    content: value ?? defaultValue,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON())
    },
  })

  // Sync controlled value when not focused (compare to avoid loop)
  useEffect(() => {
    if (!editor || value === undefined) return
    if (editor.isFocused) return
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  // Sync editable prop
  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editable, editor])

  const charCount = editor?.storage.characterCount

  return (
    <div
      className={cn(
        "border-input bg-card focus-within:border-primary focus-within:ring-ring/50 overflow-hidden rounded-[6px] border transition-[border-color,box-shadow] focus-within:ring-[3px]",
        className
      )}
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: maxHeight ? "auto" : undefined,
        }}
        className="px-4 py-3"
      />
      {showCharacterCount && charCount && (
        <div className="border-border text-muted-foreground border-t px-4 py-1.5 text-right text-xs">
          {maxCharacters
            ? t("charactersMax", { count: charCount.characters(), max: maxCharacters })
            : t("characters", { count: charCount.characters() })}
        </div>
      )}
    </div>
  )
}
