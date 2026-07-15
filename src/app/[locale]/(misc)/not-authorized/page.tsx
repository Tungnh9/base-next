import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { BackButton } from "@/components/common/back-button"
import { MiscIllustratedPage } from "@/components/common/misc-illustrated-page"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("notAuthorized")} — ${t("siteName")}` }
}

export default async function NotAuthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [{ locale }, t, tCommon] = await Promise.all([
    params,
    getTranslations("misc.notAuthorized"),
    getTranslations("common"),
  ])

  return (
    <MiscIllustratedPage
      title={t("title")}
      subtitle={<p className="max-w-md">{t("subtitle")}</p>}
      illustrationSrc="/images/notify/you-are-not-authorized.png"
      illustrationWidth={171}
      illustrationHeight={500}
    >
      <div className="relative z-10 mt-6 flex items-center gap-3">
        <BackButton label={tCommon("back")} className="mt-0" />
        <Button asChild>
          <Link href={`/${locale}${ROUTES.login}`}>{t("action")}</Link>
        </Button>
      </div>
    </MiscIllustratedPage>
  )
}
