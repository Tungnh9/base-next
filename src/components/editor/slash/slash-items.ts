import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
} from "lucide-react"
import type { SlashItem } from "./types"

export interface SlashLabels {
  heading1: string
  heading2: string
  heading3: string
  bulletList: string
  orderedList: string
  taskList: string
  blockquote: string
  codeBlock: string
  horizontalRule: string
}

export function createSlashItems(labels: SlashLabels): SlashItem[] {
  return [
    {
      id: "heading1",
      title: labels.heading1,
      icon: Heading1,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
    },
    {
      id: "heading2",
      title: labels.heading2,
      icon: Heading2,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
    },
    {
      id: "heading3",
      title: labels.heading3,
      icon: Heading3,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
    },
    {
      id: "bulletList",
      title: labels.bulletList,
      icon: List,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      id: "orderedList",
      title: labels.orderedList,
      icon: ListOrdered,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      id: "taskList",
      title: labels.taskList,
      icon: ListTodo,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      id: "blockquote",
      title: labels.blockquote,
      icon: Quote,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      id: "codeBlock",
      title: labels.codeBlock,
      icon: Code2,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      id: "horizontalRule",
      title: labels.horizontalRule,
      icon: Minus,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
  ]
}
