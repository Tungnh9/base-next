import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { requireRole } from "@/lib/auth"
import { getEmployeeById } from "@/features/employees/actions"
import { EmployeeDetail } from "@/features/employees"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("employees")} — ${t("siteName")}` }
}

interface EmployeeDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { locale, id } = await params
  await requireRole(locale, ["admin"])

  const { data: employee, error } = await getEmployeeById(id)
  if (error || !employee) notFound()

  return (
    <div className="flex flex-1 flex-col p-6">
      <EmployeeDetail employee={employee} />
    </div>
  )
}
