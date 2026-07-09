"use client"

import dynamic from "next/dynamic"
import { NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/core"
import { cn } from "@/lib/utils"
import { buildChartOption } from "./build-option"
import type { ChartAttrs } from "./types"

// echarts-for-react touches the DOM at import time — load client-only.
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

export function ChartNodeView({ node, selected }: NodeViewProps) {
  const attrs = node.attrs as ChartAttrs
  const option = buildChartOption(attrs)

  return (
    <NodeViewWrapper className={cn("chart-embed", selected && "chart-embed-selected")}>
      <ReactECharts option={option} style={{ height: 320, width: "100%" }} notMerge />
    </NodeViewWrapper>
  )
}
