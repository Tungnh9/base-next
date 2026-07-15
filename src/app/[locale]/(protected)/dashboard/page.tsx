import { getTranslations } from "next-intl/server"
import { RichTextEditor } from "@/components/editor/rich-text-editor"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("dashboard")} — ${t("siteName")}` }
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <RichTextEditor />
    </div>
  )
}
