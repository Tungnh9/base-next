"use client"

import { useMemo, useEffect, useRef, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { createExtensions } from "./extensions"
import { EditorToolbar } from "./toolbar/editor-toolbar"
import { EditorBubbleMenu } from "./menus/editor-bubble-menu"
import { AttachmentBar } from "./attachment/attachment-bar"
import { useAttachments } from "./attachment/use-attachments"
import { ATTACH_FILE_EVENT } from "./attachment/events"
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
        mentionGroupLabel: t("mention.groupLabel"),
        mentionLoadingLabel: t("mention.loading"),
        slashNoResultsLabel: t("slash.noResults"),
        slashGroupLabels: {
          text: t("slash.groups.text"),
          heading: t("slash.groups.heading"),
          list: t("slash.groups.list"),
          block: t("slash.groups.block"),
          media: t("slash.groups.media"),
        },
        slashLabels: {
          paragraph: {
            title: t("heading.paragraph"),
            description: t("slash.descriptions.paragraph"),
          },
          heading1: { title: t("heading.h1"), description: t("slash.descriptions.heading1") },
          heading2: { title: t("heading.h2"), description: t("slash.descriptions.heading2") },
          heading3: { title: t("heading.h3"), description: t("slash.descriptions.heading3") },
          bulletList: {
            title: t("toolbar.bulletList"),
            description: t("slash.descriptions.bulletList"),
          },
          orderedList: {
            title: t("toolbar.orderedList"),
            description: t("slash.descriptions.orderedList"),
          },
          taskList: { title: t("toolbar.taskList"), description: t("slash.descriptions.taskList") },
          blockquote: {
            title: t("heading.blockquote"),
            description: t("slash.descriptions.blockquote"),
          },
          codeBlock: {
            title: t("heading.codeBlock"),
            description: t("slash.descriptions.codeBlock"),
          },
          horizontalRule: {
            title: t("toolbar.horizontalRule"),
            description: t("slash.descriptions.horizontalRule"),
          },
          table: { title: t("toolbar.table"), description: t("slash.descriptions.table") },
          image: { title: t("toolbar.image"), description: t("slash.descriptions.image") },
          attachment: {
            title: t("toolbar.attachment"),
            description: t("slash.descriptions.attachment"),
          },
          imageUrlPrompt: t("slash.imageUrlPrompt"),
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
  const { attachments, addFile, removeAttachment } = useAttachments()
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const triggerAttachmentPicker = useCallback(() => attachmentInputRef.current?.click(), [])

  // Slash command's "attachment" item can't reach React state directly, so it
  // dispatches a DOM event instead — listen for it here.
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    dom.addEventListener(ATTACH_FILE_EVENT, triggerAttachmentPicker)
    return () => dom.removeEventListener(ATTACH_FILE_EVENT, triggerAttachmentPicker)
  }, [editor, triggerAttachmentPicker])

  return (
    <div
      className={cn(
        "border-input bg-card focus-within:border-primary focus-within:ring-ring/50 overflow-hidden rounded-[6px] border transition-[border-color,box-shadow] focus-within:ring-[3px]",
        className
      )}
    >
      {editable && <EditorToolbar editor={editor} onAttachClick={triggerAttachmentPicker} />}
      {editable && <EditorBubbleMenu editor={editor} />}
      <input
        ref={attachmentInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) addFile(file)
          e.target.value = ""
        }}
      />
      <EditorContent
        editor={editor}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: maxHeight ? "auto" : undefined,
        }}
        className="px-4 py-3"
      />
      {editable && <AttachmentBar attachments={attachments} onRemove={removeAttachment} />}
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
