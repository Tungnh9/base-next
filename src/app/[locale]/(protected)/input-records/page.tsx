import { getTranslations } from "next-intl/server"
import { FileInput } from "lucide-react"
import { FeaturePlaceholder } from "@/components/common/feature-placeholder"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [tNav, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "metadata" }),
  ])
  return { title: `${tNav("inputRecords")} — ${tMeta("siteName")}` }
}

export default async function InputRecordsPage() {
  const t = await getTranslations()

  return (
    <div className="flex flex-1 flex-col p-6">
      <FeaturePlaceholder
        icon={FileInput}
        title={t("nav.inputRecords")}
        badgeLabel={t("nav.comingSoonBadge")}
      />
    </div>
  )
}
