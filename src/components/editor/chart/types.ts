export type ChartType = "bar" | "line" | "area" | "pie"

export interface ChartSeries {
  name: string
  data: number[]
}

export interface ChartAttrs {
  chartType: ChartType
  title: string
  categories: string[]
  series: ChartSeries[]
}
