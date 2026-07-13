"use client"

import { useState, type ReactNode } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import { useEditorState } from "@tiptap/react"
import type { Editor } from "@tiptap/core"
import { useTranslations } from "next-intl"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link2,
  RemoveFormatting,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BubbleButtonProps {
  icon: ReactNode
  label: string
  isActive?: boolean
  onClick: () => void
}

function BubbleButton({ icon, label, isActive, onClick }: BubbleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "flex size-7 items-center justify-center rounded-[4px] transition-colors hover:bg-white/20",
        isActive ? "text-white" : "text-white/70"
      )}
    >
      {icon}
    </button>
  )
}

interface EditorBubbleMenuProps {
  editor: Editor | null
}

const FALLBACK = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false,
  link: false,
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const t = useTranslations("editor")
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const activeState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor
      if (!e) return FALLBACK
      return {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        code: e.isActive("code"),
        link: e.isActive("link"),
      }
    },
  })

  // Close the inline link editor whenever the selection range changes.
  // (Adjusting state during render, per React's docs — not an effect, so no
  // cascading-render lint issue: https://react.dev/learn/you-might-not-need-an-effect)
  const selectionKey = editor ? `${editor.state.selection.from}-${editor.state.selection.to}` : ""
  const [prevSelectionKey, setPrevSelectionKey] = useState(selectionKey)
  if (selectionKey !== prevSelectionKey) {
    setPrevSelectionKey(selectionKey)
    setLinkOpen(false)
  }

  if (!editor || !activeState) return null

  function openLinkEditor() {
    setLinkUrl(editor?.getAttributes("link").href ?? "")
    setLinkOpen(true)
  }

  function applyLink() {
    if (!editor) return
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run()
    }
    setLinkOpen(false)
  }

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-[6px] bg-[rgba(30,28,48,0.9)] px-1.5 py-1 shadow-[0_4px_18px_rgba(0,0,0,0.25)]"
    >
      {linkOpen ? (
        <div className="flex items-center gap-1.5 px-1">
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyLink()
              }
              if (e.key === "Escape") setLinkOpen(false)
            }}
            placeholder="https://example.com"
            className="h-6 w-44 rounded-[4px] bg-white/10 px-2 text-[12px] text-white outline-none placeholder:text-white/40"
          />
          <BubbleButton
            icon={<Check className="size-3.5" />}
            label={t("link.title")}
            onClick={applyLink}
          />
        </div>
      ) : (
        <>
          <BubbleButton
            icon={<Bold className="size-3.5" />}
            label={t("toolbar.bold")}
            isActive={activeState.bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <BubbleButton
            icon={<Italic className="size-3.5" />}
            label={t("toolbar.italic")}
            isActive={activeState.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <BubbleButton
            icon={<Underline className="size-3.5" />}
            label={t("toolbar.underline")}
            isActive={activeState.underline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <BubbleButton
            icon={<Strikethrough className="size-3.5" />}
            label={t("toolbar.strike")}
            isActive={activeState.strike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <div className="mx-0.5 h-4 w-px bg-white/20" />
          <BubbleButton
            icon={<Code className="size-3.5" />}
            label={t("toolbar.code")}
            isActive={activeState.code}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />
          <BubbleButton
            icon={<Link2 className="size-3.5" />}
            label={t("toolbar.link")}
            isActive={activeState.link}
            onClick={openLinkEditor}
          />
          <div className="mx-0.5 h-4 w-px bg-white/20" />
          <BubbleButton
            icon={<RemoveFormatting className="size-3.5" />}
            label={t("toolbar.clearFormat")}
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
          />
        </>
      )}
    </BubbleMenu>
  )
}
