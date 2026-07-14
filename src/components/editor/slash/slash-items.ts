import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
  Table as TableIcon,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react"
import { ATTACH_FILE_EVENT } from "../attachment/events"
import type { SlashItem } from "./types"

interface SlashItemLabel {
  title: string
  description: string
}

export interface SlashLabels {
  paragraph: SlashItemLabel
  heading1: SlashItemLabel
  heading2: SlashItemLabel
  heading3: SlashItemLabel
  bulletList: SlashItemLabel
  orderedList: SlashItemLabel
  taskList: SlashItemLabel
  blockquote: SlashItemLabel
  codeBlock: SlashItemLabel
  horizontalRule: SlashItemLabel
  table: SlashItemLabel
  image: SlashItemLabel
  attachment: SlashItemLabel
  imageUrlPrompt: string
}

export function createSlashItems(labels: SlashLabels): SlashItem[] {
  return [
    {
      id: "paragraph",
      group: "text",
      icon: Type,
      title: labels.paragraph.title,
      description: labels.paragraph.description,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      id: "heading1",
      group: "heading",
      icon: Heading1,
      title: labels.heading1.title,
      description: labels.heading1.description,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
    },
    {
      id: "heading2",
      group: "heading",
      icon: Heading2,
      title: labels.heading2.title,
      description: labels.heading2.description,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
    },
    {
      id: "heading3",
      group: "heading",
      icon: Heading3,
      title: labels.heading3.title,
      description: labels.heading3.description,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
    },
    {
      id: "bulletList",
      group: "list",
      icon: List,
      title: labels.bulletList.title,
      description: labels.bulletList.description,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      id: "orderedList",
      group: "list",
      icon: ListOrdered,
      title: labels.orderedList.title,
      description: labels.orderedList.description,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      id: "taskList",
      group: "list",
      icon: ListTodo,
      title: labels.taskList.title,
      description: labels.taskList.description,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      id: "blockquote",
      group: "block",
      icon: Quote,
      title: labels.blockquote.title,
      description: labels.blockquote.description,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      id: "codeBlock",
      group: "block",
      icon: Code2,
      title: labels.codeBlock.title,
      description: labels.codeBlock.description,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      id: "horizontalRule",
      group: "block",
      icon: Minus,
      title: labels.horizontalRule.title,
      description: labels.horizontalRule.description,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      id: "table",
      group: "media",
      icon: TableIcon,
      title: labels.table.title,
      description: labels.table.description,
      run: (editor, range) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      id: "image",
      group: "media",
      icon: ImageIcon,
      title: labels.image.title,
      description: labels.image.description,
      run: (editor, range) => {
        const url = window.prompt(labels.imageUrlPrompt)
        if (url) editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
      },
    },
    {
      id: "attachment",
      group: "media",
      icon: Paperclip,
      title: labels.attachment.title,
      description: labels.attachment.description,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run()
        editor.view.dom.dispatchEvent(new CustomEvent(ATTACH_FILE_EVENT, { bubbles: true }))
      },
    },
  ]
}
