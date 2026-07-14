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
}

export function Providers({ children, locale, messages, timeZone }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>{children}</TooltipProvider>
        <SonnerToaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
