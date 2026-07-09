import { Extension } from "@tiptap/core"
import { PluginKey } from "@tiptap/pm/state"
import Suggestion from "@tiptap/suggestion"
import { createSuggestionRender } from "../lib/suggestion-popup"
import { SlashList } from "./slash-list"
import { createSlashItems, type SlashLabels } from "./slash-items"
import type { SlashItem } from "./types"

interface SlashCommandOptions {
  labels: SlashLabels
  noResultsLabel: string
}

const slashCommandPluginKey = new PluginKey("slashCommand")

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      labels: {
        heading1: "Heading 1",
        heading2: "Heading 2",
        heading3: "Heading 3",
        bulletList: "Bullet list",
        orderedList: "Ordered list",
        taskList: "Task list",
        blockquote: "Quote",
        codeBlock: "Code block",
        horizontalRule: "Horizontal rule",
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
        render: createSuggestionRender<SlashItem, { noResultsLabel: string }>(SlashList, {
          noResultsLabel: this.options.noResultsLabel,
        }),
      }),
    ]
  },
})
