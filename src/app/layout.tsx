import type { Metadata } from "next"
import { getLocale, getMessages, getTimeZone } from "next-intl/server"
import { inter } from "@/lib/fonts"
import { Providers } from "@/components/common/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    template: "%s | Base NextJS",
    default: "Base NextJS",
  },
  description: "Base NextJS template",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages, timeZone] = await Promise.all([
    getLocale(),
    getMessages(),
    getTimeZone(),
  ])

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background flex min-h-full flex-col">
        <Providers locale={locale} messages={messages} timeZone={timeZone}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
