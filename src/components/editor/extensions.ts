import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import CharacterCount from "@tiptap/extension-character-count"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight, common } from "lowlight"
import { createMentionExtension } from "./mention/mention-extension"
import { SlashCommand, type SlashGroupLabels } from "./slash/slash-command"
import { Video } from "./video/video-extension"
import { Chart } from "./chart/chart-extension"
import type { MentionItem } from "./mention/types"
import type { SlashLabels } from "./slash/slash-items"

interface ExtensionOptions {
  placeholder?: string
  maxCharacters?: number
  mentionItems?: MentionItem[]
  mentionNoResultsLabel?: string
  mentionGroupLabel?: string
  mentionLoadingLabel?: string
  slashLabels?: SlashLabels
  slashGroupLabels?: SlashGroupLabels
  slashNoResultsLabel?: string
}

export function createExtensions(options?: ExtensionOptions) {
  const lowlight = createLowlight(common)

  return [
    StarterKit.configure({ codeBlock: false }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Image.configure({ allowBase64: false }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TaskList,
    TaskItem.configure({ nested: true }),
    CharacterCount.configure({ limit: options?.maxCharacters }),
    Placeholder.configure({
      placeholder: options?.placeholder ?? "",
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Video,
    Chart,
    createMentionExtension({
      items: options?.mentionItems,
      noResultsLabel: options?.mentionNoResultsLabel,
      groupLabel: options?.mentionGroupLabel,
      loadingLabel: options?.mentionLoadingLabel,
    }),
    // Tiptap's Extension.configure() deep-merges by key — omit keys entirely
    // (rather than passing `undefined`) so addOptions()'s defaults survive.
    SlashCommand.configure({
      ...(options?.slashLabels ? { labels: options.slashLabels } : {}),
      ...(options?.slashGroupLabels ? { groupLabels: options.slashGroupLabels } : {}),
      ...(options?.slashNoResultsLabel ? { noResultsLabel: options.slashNoResultsLabel } : {}),
    }),
  ]
}
