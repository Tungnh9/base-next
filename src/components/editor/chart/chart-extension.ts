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

function parseJsonAttr<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
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
      categories: {
        default: [],
        parseHTML: (element) => parseJsonAttr(element.getAttribute("data-chart-categories"), []),
        renderHTML: (attributes) => ({
          "data-chart-categories": JSON.stringify(attributes.categories ?? []),
        }),
      },
      series: {
        default: [],
        parseHTML: (element) => parseJsonAttr(element.getAttribute("data-chart-series"), []),
        renderHTML: (attributes) => ({
          "data-chart-series": JSON.stringify(attributes.series ?? []),
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
