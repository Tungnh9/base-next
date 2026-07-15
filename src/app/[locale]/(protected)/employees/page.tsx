import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { requireRole } from "@/lib/auth"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("employees")} — ${t("siteName")}` }
}

export default async function EmployeesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireRole(locale, ["admin"])
  const t = await getTranslations("misc.comingSoon")

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-lg font-semibold text-[#5d596c]">{t("title")}</h2>
      <p className="text-muted-foreground max-w-md text-sm">{t("subtitle")}</p>
      <Image
        src="/images/notify/launching-soon.png"
        alt=""
        aria-hidden
        width={180}
        height={342}
        className="mt-4"
      />
    </div>
  )
}
