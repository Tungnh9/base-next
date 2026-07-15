"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("languageSwitcher")
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("changeLabel")}
        aria-expanded={open}
        className="flex size-[26px] cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80"
      >
        <span aria-hidden="true" className="text-[22px] leading-none">
          {LOCALE_FLAGS[currentLocale]}
        </span>
      </button>

      {open && (
        <div className="bg-popover absolute top-full right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border shadow-md">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchTo(locale)}
              className={`hover:bg-foreground/[0.08] flex w-full cursor-pointer items-center px-3 py-2 text-sm transition-colors ${
                locale === currentLocale ? "text-primary font-semibold" : "text-foreground"
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
