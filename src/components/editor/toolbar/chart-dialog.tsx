"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { ChartColumn, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToolbarButton } from "./toolbar-button"
import type { ChartDataPoint, ChartType } from "../chart/types"

interface ChartDialogProps {
  editor: Editor
}

const CHART_TYPES: ChartType[] = ["bar", "line", "area", "pie"]
const EMPTY_ROW: ChartDataPoint = { label: "", value: 0 }

export function ChartDialog({ editor }: ChartDialogProps) {
  const t = useTranslations("editor")
  const tCommon = useTranslations("common")

  const [open, setOpen] = useState(false)
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [title, setTitle] = useState("")
  const [rows, setRows] = useState<ChartDataPoint[]>([{ ...EMPTY_ROW }, { ...EMPTY_ROW }])

  const handleClose = () => {
    setOpen(false)
    setChartType("bar")
    setTitle("")
    setRows([{ ...EMPTY_ROW }, { ...EMPTY_ROW }])
  }

  const updateRow = (index: number, patch: Partial<ChartDataPoint>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }])
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index))

  const validRows = rows.filter((row) => row.label.trim() !== "")
  const canInsert = validRows.length >= 1

  const handleInsert = () => {
    if (!canInsert) return
    editor.chain().focus().setChart({ chartType, title, data: validRows }).run()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ToolbarButton tooltip={t("toolbar.chart")}>
          <ChartColumn />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("chart.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`chart.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("chart.titlePlaceholder")}
              className="flex-1"
            />
          </div>

          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={row.label}
                  onChange={(e) => updateRow(index, { label: e.target.value })}
                  placeholder={t("chart.labelPlaceholder")}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={row.value}
                  onChange={(e) => updateRow(index, { value: Number(e.target.value) })}
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={rows.length <= 1}
                  aria-label={t("chart.removeRow")}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1">
              <Plus className="size-3.5" />
              {t("chart.addRow")}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
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
