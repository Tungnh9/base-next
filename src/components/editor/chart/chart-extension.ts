import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ChartNodeView } from "./chart-node-view"
import type { ChartAttrs } from "./types"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    chart: {
      setChart: (attrs: ChartAttrs) => ReturnType
    }
  }
}

// Renders a bar/line/area/pie chart via echarts. Data is entered manually
// through the toolbar dialog — no backend/data-source wiring yet.
export const Chart = Node.create({
  name: "chart",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      chartType: { default: "bar" },
      title: { default: "" },
      data: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-chart-json")
          if (!raw) return []
          try {
            return JSON.parse(raw)
          } catch {
            return []
          }
        },
        renderHTML: (attributes) => ({
          "data-chart-json": JSON.stringify(attributes.data ?? []),
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div[data-chart-embed]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-chart-embed": "" })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartNodeView)
  },

  addCommands() {
    return {
      setChart:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})
