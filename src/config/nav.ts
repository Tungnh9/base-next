import { BarChart2, Calendar, LayoutDashboard } from "lucide-react"
import type * as React from "react"
import { ROUTES } from "@/lib/constants"

export interface NavItem {
  // Stores an i18n key — resolve with useTranslations() before rendering
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export interface NavSection {
  // Stores an i18n key when present — resolve with useTranslations() before rendering
  title?: string
  items: NavItem[]
}

// Factory function — returns nav config (useful for testing and for deriving subsets)
export function createNavConfig(): NavSection[] {
  return [
    {
      items: [{ label: "nav.dashboard", href: ROUTES.dashboard, icon: LayoutDashboard }],
    },
    {
      title: "nav.sectionAppsAndPages",
      items: [
        { label: "nav.analytics", href: ROUTES.analytics, icon: BarChart2 },
        { label: "nav.calendar", href: ROUTES.calendar, icon: Calendar },
      ],
    },
  ]
}

export const NAV: NavSection[] = createNavConfig()
export const NAV_ITEMS: NavItem[] = NAV.flatMap((s) => s.items)
