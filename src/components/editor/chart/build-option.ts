import type { ChartAttrs } from "./types"

// Builds an ECharts `option` object from our simplified ChartAttrs shape.
export function buildChartOption({ chartType, title, data }: ChartAttrs) {
  const titleOption = title ? { text: title, left: "center" } : undefined

  if (chartType === "pie") {
    return {
      title: titleOption,
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: "60%",
          data: data.map((d) => ({ name: d.label, value: d.value })),
        },
      ],
    }
  }

  return {
    title: titleOption,
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: data.map((d) => d.label) },
    yAxis: { type: "value" },
    series: [
      {
        type: chartType === "area" ? "line" : chartType,
        data: data.map((d) => d.value),
        smooth: chartType === "area",
        areaStyle: chartType === "area" ? {} : undefined,
      },
    ],
  }
}
