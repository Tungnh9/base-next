import { getTranslations } from "next-intl/server"
import { getDashboardStats } from "@/features/dashboard/api"
import {
  CUSTOMER_STATUSES,
  EMPLOYEE_STATUSES,
  STATUS_LABEL_KEYS,
  STATUS_VARIANT,
} from "@/features/dashboard/types"
import { StatCard } from "@/features/dashboard/components/stat-card"
import { StatusBreakdown } from "@/features/dashboard/components/status-breakdown"
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("dashboard")} — ${t("siteName")}` }
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "dashboard" })
  const stats = await getDashboardStats()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title={t("totalCustomers")}
          value={stats.totalCustomers}
          description={
            <StatusBreakdown
              items={CUSTOMER_STATUSES.map((status) => ({
                key: status,
                label: t(STATUS_LABEL_KEYS[status]),
                count: stats.customersByStatus[status],
                variant: STATUS_VARIANT[status],
              }))}
            />
          }
        />
        <StatCard
          title={t("totalEmployees")}
          value={stats.totalEmployees}
          description={
            <StatusBreakdown
              items={EMPLOYEE_STATUSES.map((status) => ({
                key: status,
                label: t(STATUS_LABEL_KEYS[status]),
                count: stats.employeesByStatus[status],
                variant: STATUS_VARIANT[status],
              }))}
            />
          }
        />
      </div>

      <DashboardCharts stats={stats} />
    </div>
  )
}
