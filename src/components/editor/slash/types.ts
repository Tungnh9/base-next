import type { Editor, Range } from "@tiptap/core"
import type { LucideIcon } from "lucide-react"

export interface SlashItem {
  id: string
  title: string
  icon: LucideIcon
  run: (editor: Editor, range: Range) => void
}
