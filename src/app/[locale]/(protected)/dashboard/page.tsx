import { getTranslations } from "next-intl/server"
import { getDashboardStats } from "@/features/dashboard/api"
import { STATUS_LABEL_KEYS } from "@/features/dashboard/types"
import { StatCard } from "@/features/dashboard/components/stat-card"
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
            <>
              {stats.customersByStatus.active} {t(STATUS_LABEL_KEYS.active)} ·{" "}
              {stats.customersByStatus.inactive} {t(STATUS_LABEL_KEYS.inactive)}
            </>
          }
        />
        <StatCard
          title={t("totalEmployees")}
          value={stats.totalEmployees}
          description={
            <>
              {stats.employeesByStatus.active} {t(STATUS_LABEL_KEYS.active)} ·{" "}
              {stats.employeesByStatus.inactive} {t(STATUS_LABEL_KEYS.inactive)} ·{" "}
              {stats.employeesByStatus["on-leave"]} {t(STATUS_LABEL_KEYS["on-leave"])}
            </>
          }
        />
      </div>

      <DashboardCharts stats={stats} />
    </div>
  )
}
