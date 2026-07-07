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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  RemoveFormatting,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ToolbarButton } from "./toolbar-button"
import { HeadingSelect } from "./heading-select"
import { ColorPicker } from "./color-picker"
import { LinkPopover } from "./link-popover"
import { ImageDialog } from "./image-dialog"
import { TableMenu } from "./table-menu"

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
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

      <Separator orientation="vertical" className="mx-1 h-5" />

      <HeadingSelect editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-5" />

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

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ColorPicker editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        tooltip={t("toolbar.alignLeft")}
      >
        <AlignLeft />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        tooltip={t("toolbar.alignCenter")}
      >
        <AlignCenter />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        tooltip={t("toolbar.alignRight")}
      >
        <AlignRight />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        tooltip={t("toolbar.alignJustify")}
      >
        <AlignJustify />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Lists */}
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

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Insert */}
      <LinkPopover editor={editor} />
      <ImageDialog editor={editor} />
      <TableMenu editor={editor} />
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip={t("toolbar.horizontalRule")}
      >
        <Minus />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Clear */}
      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        tooltip={t("toolbar.clearFormat")}
      >
        <RemoveFormatting />
      </ToolbarButton>
    </div>
  )
}
