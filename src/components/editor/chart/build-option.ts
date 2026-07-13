import type { ChartAttrs } from "./types"

const PALETTE = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#fb923c"]

// Builds an ECharts `option` object from our simplified ChartAttrs shape.
export function buildChartOption({ chartType, title, categories, series }: ChartAttrs) {
  const titleOption = title
    ? { text: title, left: "center", textStyle: { fontSize: 13, fontWeight: 600 } }
    : undefined

  if (chartType === "pie") {
    return {
      title: titleOption,
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { orient: "horizontal", bottom: 0, textStyle: { fontSize: 11 } },
      color: PALETTE,
      series: [
        {
          type: "pie",
          radius: ["0%", "60%"],
          top: title ? 30 : 0,
          data: (series[0]?.data ?? []).map((value, i) => ({
            name: categories[i] ?? `Item ${i + 1}`,
            value,
          })),
          label: { fontSize: 11 },
        },
      ],
    }
  }

  return {
    title: titleOption,
    tooltip: { trigger: "axis" },
    legend: series.length > 1 ? { bottom: 0, textStyle: { fontSize: 11 } } : undefined,
    grid: {
      left: 12,
      right: 12,
      bottom: series.length > 1 ? 36 : 12,
      top: title ? 40 : 12,
      containLabel: true,
    },
    color: PALETTE,
    xAxis: { type: "category", data: categories, axisLabel: { fontSize: 11 } },
    yAxis: { type: "value", axisLabel: { fontSize: 11 } },
    series: series.map((s) => ({
      name: s.name,
      type: chartType === "area" ? "line" : chartType,
      data: s.data,
      smooth: chartType === "area",
      ...(chartType === "area" ? { areaStyle: { opacity: 0.3 } } : {}),
    })),
  }
}

// Splits on commas/newlines, trims, drops empties — shared by categories & series inputs.
export function parseLines(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseNumbers(raw: string): number[] {
  return parseLines(raw)
    .map((s) => parseFloat(s))
    .filter((n) => !isNaN(n))
}
