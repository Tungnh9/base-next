import { OpportunityList } from "@/features/sales-opportunities"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("salesOpportunities")} — ${t("siteName")}` }
}

export default function SalesOpportunitiesPage() {
  return (
    <div className="flex flex-1 flex-col p-6">
      <OpportunityList />
    </div>
  )
}
