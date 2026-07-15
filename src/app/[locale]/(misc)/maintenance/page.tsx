import { getTranslations } from "next-intl/server"
import { BackButton } from "@/components/common/back-button"
import { MiscIllustratedPage } from "@/components/common/misc-illustrated-page"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("maintenance")} — ${t("siteName")}` }
}

export default async function MaintenancePage() {
  const [t, tCommon] = await Promise.all([
    getTranslations("misc.maintenance"),
    getTranslations("common"),
  ])

  return (
    <MiscIllustratedPage
      title={t("title")}
      subtitle={t("subtitle")}
      illustrationSrc="/images/notify/under-maintenance.png"
      illustrationWidth={622}
      illustrationHeight={500}
    >
      <BackButton label={tCommon("back")} />
    </MiscIllustratedPage>
  )
}
