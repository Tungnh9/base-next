import type { Editor, Range } from "@tiptap/core"
import type { LucideIcon } from "lucide-react"

export type SlashGroup = "text" | "heading" | "list" | "block" | "media"

export interface SlashItem {
  id: string
  title: string
  description: string
  group: SlashGroup
  icon: LucideIcon
  run: (editor: Editor, range: Range) => void
}
