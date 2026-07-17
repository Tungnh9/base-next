"use client"

import { useEffect } from "react"
import "@/app/globals.css"
import { inter } from "@/lib/fonts"
import { Button } from "@/components/ui/button"
import viMessages from "../../messages/vi.json"
import enMessages from "../../messages/en.json"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// This file replaces the root layout entirely when an error escapes even
// the root layout — including a possible failure inside the [locale]
// segment that normally sets up next-intl's provider. useTranslations()/
// getLocale() aren't reliably available here, so the locale is read
// straight from the URL and messages are pulled directly from the JSON
// files instead of going through the hook-based API.
const MESSAGES = { vi: viMessages, en: enMessages }

function detectLocale(): keyof typeof MESSAGES {
  if (typeof window === "undefined") return "vi"
  return window.location.pathname.startsWith("/en") ? "en" : "vi"
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const locale = detectLocale()
  const t = MESSAGES[locale]

  return (
    <html lang={locale} className={`${inter.variable}`}>
      <body className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h2>{t.errors.criticalError}</h2>
          <Button
            onClick={reset}
            className="bg-black text-white enabled:hover:brightness-90 enabled:active:brightness-[0.85]"
          >
            {t.common.retry}
          </Button>
        </div>
      </body>
    </html>
  )
}
