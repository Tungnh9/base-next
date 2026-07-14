import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("employees")} — ${t("siteName")}` }
}

export default function EmployeesPage() {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
        Trang Nhân viên — coming soon
      </div>
    </div>
  )
}
