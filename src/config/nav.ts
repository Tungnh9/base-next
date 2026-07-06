import { BarChart2, Calendar, LayoutDashboard } from "lucide-react"
import type * as React from "react"

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const NAV: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Apps & Pages",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart2 },
      { label: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV.flatMap((s) => s.items)
