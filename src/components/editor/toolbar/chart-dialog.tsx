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

const CHART_TYPES: { type: ChartType; icon: typeof BarChart2 }[] = [
  { type: "bar", icon: BarChart2 },
  { type: "line", icon: LineChart },
  { type: "area", icon: TrendingUp },
  { type: "pie", icon: PieChart },
]

const DEFAULT_CATEGORIES = "January, February, March, April, May, June"
const DEFAULT_SERIES: SeriesRow[] = [
  { id: "1", name: "Series 1", dataRaw: "120, 200, 150, 80, 70, 110" },
]

let rowIdCounter = 0
function nextRowId() {
  rowIdCounter += 1
  return `row-${rowIdCounter}`
}

// Shared class strings for form controls — text-foreground ensures text is
// visible in both light and dark modes.
const inputCls =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/50 w-full rounded-[6px] border px-3 py-2 text-[13px] outline-none focus:ring-[3px] transition-[border-color,box-shadow]"
const textareaCls =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/50 w-full resize-none rounded-[6px] border px-3 py-2 font-mono text-xs outline-none focus:ring-[3px] transition-[border-color,box-shadow]"
const innerInputCls =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/50 flex-1 rounded-[5px] border px-2.5 py-1.5 text-xs outline-none focus:ring-[2px] transition-[border-color,box-shadow]"
const innerTextareaCls =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/50 w-full resize-none rounded-[5px] border px-2.5 py-1.5 font-mono text-xs outline-none focus:ring-[2px] transition-[border-color,box-shadow]"
const sectionLabel =
  "text-muted-foreground mb-2 block text-[11px] font-semibold tracking-wide uppercase"

export function ChartDialog({ editor }: ChartDialogProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")

  const [open, setOpen] = useState(false)
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [title, setTitle] = useState("")
  const [categoriesRaw, setCategoriesRaw] = useState(DEFAULT_CATEGORIES)
  const [seriesRows, setSeriesRows] = useState<SeriesRow[]>(DEFAULT_SERIES)

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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        else setOpen(true)
      }}
    >
      <DialogTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.chart")}>
          <ChartColumn />
        </ToolbarButton>
      </DialogTrigger>

      {/* max-w override must include sm: prefix — base DialogContent has
          sm:max-w-[500px] which twMerge treats as a separate class group */}
      <DialogContent className="max-h-[90vh] max-w-[min(960px,calc(100vw-2rem))] overflow-hidden p-0 sm:max-w-[min(960px,calc(100vw-2rem))]">
        <DialogHeader className="border-border border-b px-6 py-4">
          <DialogTitle>{t("chart.title")}</DialogTitle>
        </DialogHeader>

        <div className="divide-border flex min-h-0 flex-1 divide-x overflow-hidden">
          {/* ── Left panel: form ─────────────────────────────── */}
          <div className="flex w-[45%] max-w-[440px] min-w-[280px] shrink-0 flex-col gap-5 overflow-y-auto p-6">
            {/* Chart type */}
            <div>
              <label className={sectionLabel}>{t("chart.chartTypeLabel")}</label>
              <div className="grid grid-cols-4 gap-2">
                {CHART_TYPES.map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setChartType(type)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-[8px] border py-3 text-[12px] font-medium transition-colors",
                      chartType === type
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border bg-muted text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <Icon className="size-5" />
                    {t(`chart.types.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={sectionLabel}>{t("chart.titleLabel")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("chart.titlePlaceholder")}
                className={inputCls}
              />
            </div>

            {/* Categories */}
            <div>
              <label className={sectionLabel}>
                {isPie ? t("chart.categoriesLabelPie") : t("chart.categoriesLabel")}
              </label>
              <textarea
                value={categoriesRaw}
                onChange={(e) => setCategoriesRaw(e.target.value)}
                placeholder={t("chart.categoriesPlaceholder")}
                rows={3}
                className={textareaCls}
              />
              <p className="text-muted-foreground mt-1.5 text-[11px]">
                {t("chart.categoriesHint")}
              </p>
            </div>

            {/* Series */}
            <div>
              <label className={sectionLabel}>
                {isPie ? t("chart.seriesLabelPie") : t("chart.seriesLabel")}
              </label>
              <div className="flex flex-col gap-2.5">
                {effectiveRows.map((row, idx) => (
                  <div key={row.id} className="border-border bg-muted/50 rounded-[8px] border p-3">
                    {!isPie && (
                      <div className="mb-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateSeries(row.id, "name", e.target.value)}
                          placeholder={t("chart.seriesNamePlaceholder", { index: idx + 1 })}
                          className={innerInputCls}
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
                      className={innerTextareaCls}
                    />
                  </div>
                ))}
              </div>

              {!isPie && (
                <button
                  type="button"
                  onClick={addSeries}
                  className="text-primary mt-3 flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-70"
                >
                  <Plus className="size-4" />
                  {t("chart.addSeries")}
                </button>
              )}
            </div>
          </div>

          {/* ── Right panel: live preview ─────────────────────── */}
          <div className="bg-muted/30 flex flex-1 flex-col p-6">
            <p className={sectionLabel}>{t("chart.preview")}</p>
            <div className="border-border bg-card flex-1 rounded-[10px] border p-4">
              {open && (
                <ReactECharts
                  option={previewOption}
                  style={{ height: "100%", minHeight: 360 }}
                  notMerge
                />
              )}
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
