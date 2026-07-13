"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { ChartColumn, BarChart2, LineChart, PieChart, TrendingUp, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ToolbarButton } from "./toolbar-button"
import { buildChartOption, parseLines, parseNumbers } from "../chart/build-option"
import type { ChartType } from "../chart/types"

// echarts-for-react touches the DOM at import time — load client-only.
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

interface ChartDialogProps {
  editor: Editor
}

interface SeriesRow {
  id: string
  name: string
  dataRaw: string
}

const DEFAULT_CATEGORIES = "January, February, March, April, May, June"
const DEFAULT_SERIES: SeriesRow[] = [
  { id: "1", name: "Series 1", dataRaw: "120, 200, 150, 80, 70, 110" },
]

let rowIdCounter = 0
function nextRowId() {
  rowIdCounter += 1
  return `row-${rowIdCounter}`
}

export function ChartDialog({ editor }: ChartDialogProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")

  const [open, setOpen] = useState(false)
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [title, setTitle] = useState("")
  const [categoriesRaw, setCategoriesRaw] = useState(DEFAULT_CATEGORIES)
  const [seriesRows, setSeriesRows] = useState<SeriesRow[]>(DEFAULT_SERIES)

  const CHART_TYPES: { type: ChartType; icon: typeof BarChart2 }[] = [
    { type: "bar", icon: BarChart2 },
    { type: "line", icon: LineChart },
    { type: "area", icon: TrendingUp },
    { type: "pie", icon: PieChart },
  ]

  const isPie = chartType === "pie"
  const effectiveRows = isPie ? seriesRows.slice(0, 1) : seriesRows

  const categories = useMemo(() => parseLines(categoriesRaw), [categoriesRaw])
  const series = useMemo(
    () => effectiveRows.map((row) => ({ name: row.name, data: parseNumbers(row.dataRaw) })),
    [effectiveRows]
  )
  const previewOption = useMemo(
    () => buildChartOption({ chartType, title, categories, series }),
    [chartType, title, categories, series]
  )

  const canInsert = series.some((s) => s.data.length > 0)

  function handleClose() {
    setOpen(false)
    setChartType("bar")
    setTitle("")
    setCategoriesRaw(DEFAULT_CATEGORIES)
    setSeriesRows(DEFAULT_SERIES)
  }

  function updateSeries(id: string, field: "name" | "dataRaw", value: string) {
    setSeriesRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  function addSeries() {
    setSeriesRows((prev) => [
      ...prev,
      {
        id: nextRowId(),
        name: t("chart.seriesNamePlaceholder", { index: prev.length + 1 }),
        dataRaw: "",
      },
    ])
  }

  function removeSeries(id: string) {
    setSeriesRows((prev) => prev.filter((row) => row.id !== id))
  }

  function handleInsert() {
    const finalSeries = series.filter((s) => s.data.length > 0)
    if (finalSeries.length === 0) return
    editor
      .chain()
      .focus()
      .setChart({ chartType, title: title.trim(), categories, series: finalSeries })
      .run()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.chart")}>
          <ChartColumn />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-border mb-0 border-b px-6 py-4">
          <DialogTitle>{t("chart.title")}</DialogTitle>
        </DialogHeader>

        <div className="divide-border flex divide-x">
          {/* Left: form */}
          <div className="flex w-[360px] shrink-0 flex-col gap-4 overflow-y-auto p-5">
            <div>
              <label className="text-muted-foreground mb-1.5 block text-[11px] font-semibold tracking-wide uppercase">
                {t("chart.chartTypeLabel")}
              </label>
              <div className="flex gap-1.5">
                {CHART_TYPES.map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setChartType(type)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-[7px] border py-2 text-[11px] font-medium transition-colors",
                      chartType === type
                        ? "border-primary/40 bg-primary/16 text-primary"
                        : "border-border bg-muted text-muted-foreground hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {t(`chart.types.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-muted-foreground mb-1.5 block text-[11px] font-semibold tracking-wide uppercase">
                {t("chart.title")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("chart.titlePlaceholder")}
                className="border-input bg-card focus:border-primary focus:ring-ring/50 w-full rounded-[6px] border px-3 py-2 text-[13px] outline-none focus:ring-[3px]"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1.5 block text-[11px] font-semibold tracking-wide uppercase">
                {isPie ? t("chart.categoriesLabelPie") : t("chart.categoriesLabel")}
              </label>
              <textarea
                value={categoriesRaw}
                onChange={(e) => setCategoriesRaw(e.target.value)}
                placeholder={t("chart.categoriesPlaceholder")}
                rows={3}
                className="border-input bg-card focus:border-primary focus:ring-ring/50 w-full resize-none rounded-[6px] border px-3 py-2 font-mono text-xs outline-none focus:ring-[3px]"
              />
              <p className="text-muted-foreground mt-1 text-[11px]">{t("chart.categoriesHint")}</p>
            </div>

            <div>
              <label className="text-muted-foreground mb-1.5 block text-[11px] font-semibold tracking-wide uppercase">
                {isPie ? t("chart.seriesLabelPie") : t("chart.seriesLabel")}
              </label>

              <div className="flex flex-col gap-2">
                {effectiveRows.map((row, idx) => (
                  <div key={row.id} className="border-border bg-muted rounded-[7px] border p-3">
                    {!isPie && (
                      <div className="mb-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateSeries(row.id, "name", e.target.value)}
                          placeholder={t("chart.seriesNamePlaceholder", { index: idx + 1 })}
                          className="border-input bg-card focus:border-primary focus:ring-ring/50 flex-1 rounded-[5px] border px-2.5 py-1.5 text-xs outline-none focus:ring-[2px]"
                        />
                        {seriesRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSeries(row.id)}
                            aria-label={t("chart.removeSeries")}
                            className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <textarea
                      value={row.dataRaw}
                      onChange={(e) => updateSeries(row.id, "dataRaw", e.target.value)}
                      placeholder={t("chart.seriesDataPlaceholder")}
                      rows={2}
                      className="border-input bg-card focus:border-primary focus:ring-ring/50 w-full resize-none rounded-[5px] border px-2.5 py-1.5 font-mono text-xs outline-none focus:ring-[2px]"
                    />
                  </div>
                ))}
              </div>

              {!isPie && (
                <button
                  type="button"
                  onClick={addSeries}
                  className="text-primary mt-2 flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                >
                  <Plus className="size-3.5" />
                  {t("chart.addSeries")}
                </button>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="bg-muted/40 flex flex-1 flex-col p-5">
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wide uppercase">
              {t("chart.preview")}
            </p>
            <div className="border-border bg-card flex-1 rounded-[8px] border p-3">
              {open && <ReactECharts option={previewOption} style={{ height: 300 }} notMerge />}
            </div>
          </div>
        </div>

        <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            {tCommon("cancel")}
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!canInsert}>
            {t("chart.insertBtn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
