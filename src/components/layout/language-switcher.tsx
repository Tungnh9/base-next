"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { locales, type Locale } from "@/i18n/config"

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
}

const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇺🇸",
  vi: "🇻🇳",
}

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  React.useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  function switchTo(locale: Locale) {
    setOpen(false)
    if (locale === currentLocale) return
    const segments = pathname.split("/")
    segments[1] = locale
    const qs = searchParams.toString()
    router.push(segments.join("/") + (qs ? "?" + qs : ""))
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {LOCALE_FLAGS[currentLocale]}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-lg border bg-popover shadow-md">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchTo(locale)}
              className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-foreground/[0.08] ${
                locale === currentLocale ? "font-semibold text-primary" : "text-foreground"
              }`}
            >
              {LOCALE_LABELS[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
