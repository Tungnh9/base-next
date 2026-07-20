import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { locales, type Locale } from "@/i18n/config"

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enables static rendering for this segment per next-intl's docs — the
  // actual locale resolution for getLocale()/getTranslations()/getMessages()
  // across the app comes from the X-NEXT-INTL-LOCALE header proxy.ts sets
  // (see proxy.ts), since this app uses a custom auth proxy instead of
  // next-intl's own middleware.
  setRequestLocale(locale)

  return children
}
