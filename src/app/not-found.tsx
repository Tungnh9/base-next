import { getTranslations } from "next-intl/server"
import { BackButton } from "@/components/common/back-button"
import { MiscIllustratedPage } from "@/components/common/misc-illustrated-page"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const [t, tMeta] = await Promise.all([getTranslations("errors"), getTranslations("metadata")])
  return { title: `${t("notFoundTitle")} — ${tMeta("siteName")}` }
}

export default async function NotFound() {
  const [t, tCommon] = await Promise.all([getTranslations("errors"), getTranslations("common")])

  return (
    <MiscIllustratedPage
      title={t("notFoundTitle")}
      subtitle={t("notFoundDescription")}
      illustrationSrc="/images/notify/error.png"
      illustrationWidth={220}
      illustrationHeight={488}
      illustrationAlt={t("notFoundTitle")}
    >
      <BackButton label={tCommon("back")} />
    </MiscIllustratedPage>
  )
}
