import Mention from "@tiptap/extension-mention"
import { createSuggestionRender } from "../lib/suggestion-popup"
import { MentionList } from "./mention-list"
import type { MentionItem } from "./types"

// Placeholder items — swap `items` with a real user-search API call once the backend exists.
const DEFAULT_MENTION_ITEMS: MentionItem[] = [
  { id: "1", label: "An Nguyen", email: "an.nguyen@example.com" },
  { id: "2", label: "Binh Tran", email: "binh.tran@example.com" },
  { id: "3", label: "Chi Le", email: "chi.le@example.com" },
  { id: "4", label: "Duc Pham", email: "duc.pham@example.com" },
  { id: "5", label: "Giang Vo", email: "giang.vo@example.com" },
]

interface CreateMentionExtensionOptions {
  items?: MentionItem[]
  noResultsLabel?: string
  groupLabel?: string
  loadingLabel?: string
}

export function createMentionExtension({
  items = DEFAULT_MENTION_ITEMS,
  noResultsLabel = "No results",
  groupLabel = "People",
  loadingLabel = "Searching…",
}: CreateMentionExtensionOptions) {
  return Mention.configure({
    HTMLAttributes: { class: "mention" },
    suggestion: {
      items: ({ query }) =>
        items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
      render: createSuggestionRender(MentionList, { noResultsLabel, groupLabel, loadingLabel }),
    },
  })
}
