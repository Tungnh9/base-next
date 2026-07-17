import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getCustomerById } from "@/features/customers/actions"
import { CustomerDetail } from "@/features/customers"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("customers")} — ${t("siteName")}` }
}

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params
  const { data: customer, error } = await getCustomerById(id)
  if (error || !customer) notFound()

  return (
    <div className="flex flex-1 flex-col p-6">
      <CustomerDetail customer={customer} />
    </div>
  )
}
