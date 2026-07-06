"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { BarChart2, Calendar, LayoutDashboard, LayoutGrid } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const SHORTCUTS = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "analytics", href: "/analytics", icon: BarChart2 },
  { key: "calendar", href: "/calendar", icon: Calendar },
]

export function ShortcutsDropdown() {
  const t = useTranslations()
  const { locale } = useParams<{ locale: string }>()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("shortcuts.openLabel")}
          className="text-muted-foreground hover:text-foreground flex size-[26px] items-center justify-center transition-colors"
        >
          <LayoutGrid className="size-[22px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-foreground text-[18px] font-semibold">{t("shortcuts.title")}</span>
          <LayoutGrid className="text-muted-foreground size-[22px]" />
        </div>
        <div className="divide-border grid grid-cols-3 divide-x border-t">
          {SHORTCUTS.map((s) => (
            <Link
              key={s.href}
              href={`/${locale}${s.href}`}
              className="hover:bg-accent flex flex-col items-center gap-2 px-3 py-4 text-center transition-colors"
            >
              <span className="bg-foreground/[0.08] flex size-12 items-center justify-center rounded-full">
                <s.icon className="text-foreground size-5" />
              </span>
              <span className="text-foreground text-[15px] font-semibold">
                {t(`shortcuts.items.${s.key}.label`)}
              </span>
              <span className="text-muted-foreground text-[13px]">
                {t(`shortcuts.items.${s.key}.sublabel`)}
              </span>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
