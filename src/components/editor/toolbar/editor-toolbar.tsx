"use client"

import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  RemoveFormatting,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ToolbarButton } from "./toolbar-button"
import { HeadingSelect } from "./heading-select"
import { AlignDropdown } from "./align-dropdown"
import { TextColorButton } from "./text-color-button"
import { ColorPicker } from "./color-picker"
import { ImageDialog } from "./image-dialog"
import { VideoDialog } from "./video-dialog"
import { AttachmentButton } from "./attachment-button"
import { LinkPopover } from "./link-popover"
import { EmojiPicker } from "./emoji-picker"
import { TableMenu } from "./table-menu"
import { ChartDialog } from "./chart-dialog"

interface EditorToolbarProps {
  editor: Editor | null
  onAttachClick?: () => void
}

export function EditorToolbar({ editor, onAttachClick }: EditorToolbarProps) {
  const t = useTranslations("editor")

  if (!editor) return null

  return (
    <div className="border-border flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip={t("toolbar.undo")}
      >
        <Undo2 />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip={t("toolbar.redo")}
      >
        <Redo2 />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />

      {/* Inline formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        tooltip={t("toolbar.bold")}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        tooltip={t("toolbar.italic")}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        tooltip={t("toolbar.underline")}
      >
        <Underline />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        tooltip={t("toolbar.strike")}
      >
        <Strikethrough />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        tooltip={t("toolbar.code")}
      >
        <Code />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        tooltip={t("toolbar.clearFormat")}
      >
        <RemoveFormatting />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />

      {/* Structure */}
      <HeadingSelect editor={editor} />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        tooltip={t("toolbar.bulletList")}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        tooltip={t("toolbar.orderedList")}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        tooltip={t("toolbar.taskList")}
      >
        <ListTodo />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        tooltip={t("heading.blockquote")}
      >
        <Quote />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        tooltip={t("heading.codeBlock")}
      >
        <Code2 />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip={t("toolbar.horizontalRule")}
      >
        <Minus />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />

      {/* Alignment */}
      <AlignDropdown editor={editor} />

      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />

      {/* Color */}
      <TextColorButton editor={editor} />
      <ColorPicker editor={editor} />

      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />

      {/* Media */}
      <ImageDialog editor={editor} />
      <VideoDialog editor={editor} />
      {onAttachClick && <AttachmentButton onClick={onAttachClick} />}

      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />

      {/* Insert */}
      <LinkPopover editor={editor} />
      <EmojiPicker editor={editor} />
      <TableMenu editor={editor} />
      <ChartDialog editor={editor} />
    </div>
  )
}
