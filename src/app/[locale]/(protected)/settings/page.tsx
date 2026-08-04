import { getTranslations } from "next-intl/server"
import { SettingsPage } from "@/features/settings/components/settings-page"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [tNav, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "metadata" }),
  ])
  return { title: `${tNav("settings")} — ${tMeta("siteName")}` }
}

export default function SettingsPageRoute() {
  return <SettingsPage />
}
