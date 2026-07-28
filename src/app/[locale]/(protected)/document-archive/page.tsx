import { getTranslations } from "next-intl/server"
import { Archive } from "lucide-react"
import { FeaturePlaceholder } from "@/components/common/feature-placeholder"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [tNav, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "metadata" }),
  ])
  return { title: `${tNav("documentArchive")} — ${tMeta("siteName")}` }
}

export default async function DocumentArchivePage() {
  const t = await getTranslations()

  return (
    <div className="flex flex-1 flex-col p-6">
      <FeaturePlaceholder
        icon={Archive}
        title={t("nav.documentArchive")}
        badgeLabel={t("nav.comingSoonBadge")}
      />
    </div>
  )
}
