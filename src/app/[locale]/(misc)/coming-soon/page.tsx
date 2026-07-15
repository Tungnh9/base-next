import { getTranslations } from "next-intl/server"
import { ComingSoonForm } from "@/components/common/coming-soon-form"
import { MiscIllustratedPage } from "@/components/common/misc-illustrated-page"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("comingSoon")} — ${t("siteName")}` }
}

export default async function ComingSoonPage() {
  const [t, tCommon] = await Promise.all([
    getTranslations("misc.comingSoon"),
    getTranslations("common"),
  ])

  return (
    <MiscIllustratedPage
      title={t("title")}
      subtitle={t("subtitle")}
      illustrationSrc="/images/notify/launching-soon.png"
      illustrationWidth={263}
      illustrationHeight={500}
    >
      <ComingSoonForm backLabel={tCommon("back")} successToast={t("successToast")} />
    </MiscIllustratedPage>
  )
}
