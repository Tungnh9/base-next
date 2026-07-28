import { getTranslations } from "next-intl/server"
import { Settings } from "lucide-react"
import { FeaturePlaceholder } from "@/components/common/feature-placeholder"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [tNav, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "metadata" }),
  ])
  return { title: `${tNav("settings")} — ${tMeta("siteName")}` }
}

export default async function SettingsPage() {
  const t = await getTranslations()

  return (
    <div className="flex flex-1 flex-col p-6">
      <FeaturePlaceholder
        icon={Settings}
        title={t("nav.settings")}
        badgeLabel={t("nav.comingSoonBadge")}
      />
    </div>
  )
}
