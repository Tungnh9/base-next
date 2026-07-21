"use client"

import { type FC } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  CUSTOMER_STATUSES,
  EMPLOYEE_DEPARTMENTS,
  STATUS_LABEL_KEYS,
  type DashboardStats,
} from "../types"

// echarts-for-react touches the DOM at import time — load client-only.
// Same pattern as src/components/editor/chart/chart-node-view.tsx.
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

const PALETTE = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6"]

interface DashboardChartsProps {
  stats: DashboardStats
  className?: string
}

export const DashboardCharts: FC<DashboardChartsProps> = ({ stats }) => {
  const t = useTranslations("dashboard")

  const customersByStatusOption = {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "horizontal", bottom: 0, textStyle: { fontSize: 11 } },
    color: PALETTE,
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        data: CUSTOMER_STATUSES.map((status) => ({
          name: t(STATUS_LABEL_KEYS[status]),
          value: stats.customersByStatus[status],
        })),
        label: { fontSize: 11 },
      },
    ],
  }

  const employeesByDepartmentOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 12, right: 12, bottom: 12, top: 24, containLabel: true },
    color: PALETTE,
    xAxis: {
      type: "category",
      data: EMPLOYEE_DEPARTMENTS.map((department) => t(`department.${department}`)),
      axisLabel: { fontSize: 11 },
    },
    yAxis: { type: "value", axisLabel: { fontSize: 11 } },
    series: [
      {
        type: "bar",
        data: EMPLOYEE_DEPARTMENTS.map((department) => stats.employeesByDepartment[department]),
      },
    ],
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle>{t("totalCustomers")}</CardTitle>
          <CardDescription>{t("byStatus")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts
            option={customersByStatusOption}
            style={{ height: 300, width: "100%" }}
            notMerge
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle>{t("totalEmployees")}</CardTitle>
          <CardDescription>{t("byDepartment")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts
            option={employeesByDepartmentOption}
            style={{ height: 300, width: "100%" }}
            notMerge
          />
        </CardContent>
      </Card>
    </div>
  )
}
