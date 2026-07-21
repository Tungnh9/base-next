import type { Metadata } from "next"
import { headers } from "next/headers"
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
  const [locale, messages, timeZone, requestHeaders] = await Promise.all([
    getLocale(),
    getMessages(),
    getTimeZone(),
    headers(),
  ])
  // Set by src/proxy.ts on every request — needed here because next-themes'
  // <ThemeProvider> injects its own inline script (not through anything in
  // this src/ tree) that our nonce-based CSP would otherwise block outright.
  const nonce = requestHeaders.get("x-nonce")

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background flex min-h-full flex-col">
        <Providers locale={locale} messages={messages} timeZone={timeZone} nonce={nonce}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
