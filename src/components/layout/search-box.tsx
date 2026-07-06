"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { NAV_ITEMS } from "@/config/nav"

export function SearchBox() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const t = useTranslations()
  const { locale } = useParams<{ locale: string }>()

  const filtered = NAV_ITEMS.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="hidden flex-1 items-center gap-2.5 sm:flex">
          <Search className="text-muted-foreground size-[26px] shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder={t("search.placeholder")}
            className="text-muted-foreground placeholder:text-muted-foreground w-full bg-transparent text-[15px] outline-none"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[var(--radix-popper-anchor-width)] p-0"
      >
        <p className="text-muted-foreground px-6 pt-4 pb-1.5 text-[11px] uppercase">
          {t("search.quickNav")}
        </p>
        <div className="flex flex-col gap-1 px-2 pb-2">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-4 py-3 text-[15px]">{t("search.noResults")}</p>
          ) : (
            filtered.map((r) => (
              <Link
                key={r.href}
                href={`/${locale}${r.href}`}
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-accent flex items-center gap-2 rounded-[6px] px-4 py-2 text-[15px] transition-colors"
              >
                <r.icon className="text-muted-foreground size-[18px]" />
                {r.label}
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
