export type ChartType = "bar" | "line" | "area" | "pie"

export interface ChartDataPoint {
  label: string
  value: number
}

export interface ChartAttrs {
  chartType: ChartType
  title: string
  data: ChartDataPoint[]
}
