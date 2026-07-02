import { redirect } from "next/navigation"

export default async function UiTestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/ui-test/buttons`)
}
