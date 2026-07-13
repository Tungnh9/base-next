"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { BarChart2, Calendar, FileText, LayoutGrid, Lock, Settings, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const SHORTCUTS = [
  { key: "calendar", href: "/calendar", icon: Calendar },
  { key: "invoice", href: "/invoice", icon: FileText },
  { key: "users", href: "/users", icon: Users },
  { key: "roles", href: "/roles", icon: Lock },
  { key: "dashboard", href: "/dashboard", icon: BarChart2 },
  { key: "settings", href: "/settings", icon: Settings },
]

const ROWS = [
  { id: "row-0", items: SHORTCUTS.slice(0, 2) },
  { id: "row-1", items: SHORTCUTS.slice(2, 4) },
  { id: "row-2", items: SHORTCUTS.slice(4, 6) },
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
          className="text-muted-foreground hover:text-foreground flex size-[26px] cursor-pointer items-center justify-center transition-colors"
        >
          <LayoutGrid className="size-[22px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-foreground text-[18px] font-semibold">{t("shortcuts.title")}</span>
          <LayoutGrid className="text-muted-foreground size-[22px]" />
        </div>
        <div className="border-t">
          {ROWS.map((row, rowIdx) => (
            <div key={row.id}>
              {rowIdx > 0 && <div className="border-border border-t" />}
              <div className="divide-border flex divide-x">
                {row.items.map((s) => (
                  <Link
                    key={s.href}
                    href={`/${locale}${s.href}`}
                    className="hover:bg-accent flex flex-1 flex-col items-center gap-2 px-4 py-4 text-center transition-colors"
                  >
                    <span className="bg-foreground/[0.08] flex size-12 items-center justify-center rounded-full">
                      <s.icon className="text-foreground size-6" />
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
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
