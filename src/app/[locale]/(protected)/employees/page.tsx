import { getTranslations } from "next-intl/server"
import { requireRole } from "@/lib/auth"
import { EmployeeList } from "@/features/employees"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("employees")} — ${t("siteName")}` }
}

export default async function EmployeesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireRole(locale, ["admin"])

  return (
    <div className="flex flex-1 flex-col p-6">
      <EmployeeList />
    </div>
  )
}
