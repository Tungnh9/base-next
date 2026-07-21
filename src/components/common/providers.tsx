"use client"

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

interface ProvidersProps {
  children: ReactNode
  locale: string
  messages: AbstractIntlMessages
  timeZone?: string
  // Forwarded to next-themes' <ThemeProvider nonce>, which needs it to tag
  // the inline FOUC-prevention <script> it renders (via dangerouslySetInnerHTML
  // inside the library itself) — otherwise our nonce-based CSP (src/proxy.ts)
  // blocks that script outright since there's no 'unsafe-inline' fallback.
  nonce?: string | null
}

export function Providers({ children, locale, messages, timeZone, nonce }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        nonce={nonce ?? undefined}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <SonnerToaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
