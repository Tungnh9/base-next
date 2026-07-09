"use client"

import { useMemo, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { createExtensions } from "./extensions"
import { EditorToolbar } from "./toolbar/editor-toolbar"
import { cn } from "@/lib/utils"
import type { MentionItem } from "./mention/types"

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
  mentionItems?: MentionItem[]
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
  mentionItems,
}: RichTextEditorProps) {
  const t = useTranslations("editor")
  const resolvedPlaceholder = placeholder ?? t("placeholder")

  const extensions = useMemo(
    () =>
      createExtensions({
        placeholder: resolvedPlaceholder,
        maxCharacters,
        mentionItems,
        mentionNoResultsLabel: t("mention.noResults"),
        slashNoResultsLabel: t("slash.noResults"),
        slashLabels: {
          heading1: t("heading.h1"),
          heading2: t("heading.h2"),
          heading3: t("heading.h3"),
          bulletList: t("toolbar.bulletList"),
          orderedList: t("toolbar.orderedList"),
          taskList: t("toolbar.taskList"),
          blockquote: t("heading.blockquote"),
          codeBlock: t("heading.codeBlock"),
          horizontalRule: t("toolbar.horizontalRule"),
        },
      }),
    [resolvedPlaceholder, maxCharacters, mentionItems, t]
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
