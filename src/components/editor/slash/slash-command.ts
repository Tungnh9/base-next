import { Extension } from "@tiptap/core"
import { PluginKey } from "@tiptap/pm/state"
import Suggestion from "@tiptap/suggestion"
import { createSuggestionRender } from "../lib/suggestion-popup"
import { SlashList } from "./slash-list"
import { createSlashItems, type SlashLabels } from "./slash-items"
import type { SlashItem, SlashGroup } from "./types"

export type SlashGroupLabels = Record<SlashGroup, string>

interface SlashCommandOptions {
  labels: SlashLabels
  groupLabels: SlashGroupLabels
  noResultsLabel: string
}

const slashCommandPluginKey = new PluginKey("slashCommand")

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      labels: {
        paragraph: { title: "Text", description: "Normal text" },
        heading1: { title: "Heading 1", description: "Large section title" },
        heading2: { title: "Heading 2", description: "Medium section title" },
        heading3: { title: "Heading 3", description: "Small section title" },
        bulletList: { title: "Bullet list", description: "Unordered list" },
        orderedList: { title: "Ordered list", description: "Ordered list" },
        taskList: { title: "Task list", description: "Checkable task items" },
        blockquote: { title: "Quote", description: "Highlight a quote" },
        codeBlock: { title: "Code block", description: "Multi-line code" },
        horizontalRule: { title: "Horizontal rule", description: "Divider line" },
        table: { title: "Table", description: "Insert a table" },
        image: { title: "Image", description: "Upload or embed an image" },
        attachment: { title: "File attachment", description: "Attach a file" },
        imageUrlPrompt: "Image URL",
      },
      groupLabels: {
        text: "Text",
        heading: "Headings",
        list: "Lists",
        block: "Blocks",
        media: "Media",
      },
      noResultsLabel: "No matching blocks",
    }
  },

  addProseMirrorPlugins() {
    const items = createSlashItems(this.options.labels)

    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        pluginKey: slashCommandPluginKey,
        char: "/",
        startOfLine: false,
        items: ({ query }) =>
          items
            .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10),
        command: ({ editor, range, props }) => props.run(editor, range),
        render: createSuggestionRender<
          SlashItem,
          { noResultsLabel: string; groupLabels: SlashGroupLabels }
        >(SlashList, {
          noResultsLabel: this.options.noResultsLabel,
          groupLabels: this.options.groupLabels,
        }),
      }),
    ]
  },
})
