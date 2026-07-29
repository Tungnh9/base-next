import {
  LayoutDashboard,
  UsersRound,
  UserCheck,
  Handshake,
  FileInput,
  CalendarCheck,
  TrendingUp,
  ClipboardCheck,
  Wallet,
  Receipt,
  MapPinCheck,
  Gauge,
  BarChart3,
  FileText,
  Archive,
  Settings,
} from "lucide-react"
import type * as React from "react"
import { ROUTES } from "@/lib/constants"

export interface NavItem {
  // Stores an i18n key — resolve with useTranslations() before rendering
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  // When set, only sessions with this role see the item in the sidebar
  requiredRole?: string
  // When true, item renders (icon + label) but is not a navigable link —
  // the route/page exist on disk, it's just not linked from the nav yet
  disabled?: boolean
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
      title: "nav.sectionOverview",
      items: [{ label: "nav.dashboard", href: ROUTES.dashboard, icon: LayoutDashboard }],
    },
    {
      title: "nav.sectionSalesProcess",
      items: [
        {
          label: "nav.salesOpportunities",
          href: ROUTES.salesOpportunities,
          icon: Handshake,
        },
        {
          label: "nav.inputRecords",
          href: ROUTES.inputRecords,
          icon: FileInput,
          disabled: true,
        },
        {
          label: "nav.bookingDeployment",
          href: ROUTES.bookingDeployment,
          icon: CalendarCheck,
          disabled: true,
        },
        { label: "nav.revenue", href: ROUTES.revenue, icon: TrendingUp, disabled: true },
        {
          label: "nav.acceptanceLiquidation",
          href: ROUTES.acceptanceLiquidation,
          icon: ClipboardCheck,
          disabled: true,
        },
        {
          label: "nav.paymentCollection",
          href: ROUTES.paymentCollection,
          icon: Wallet,
          disabled: true,
        },
        { label: "nav.invoices", href: ROUTES.invoices, icon: Receipt, disabled: true },
      ],
    },
    {
      title: "nav.sectionInventoryReports",
      items: [
        {
          label: "nav.locationInspection",
          href: ROUTES.locationInspection,
          icon: MapPinCheck,
          disabled: true,
        },
        {
          label: "nav.locationPerformance",
          href: ROUTES.locationPerformance,
          icon: Gauge,
          disabled: true,
        },
        {
          label: "nav.periodicReports",
          href: ROUTES.periodicReports,
          icon: BarChart3,
          disabled: true,
        },
      ],
    },
    {
      title: "nav.sectionCatalog",
      items: [
        { label: "nav.customers", href: ROUTES.customers, icon: UsersRound },
        { label: "nav.contracts", href: ROUTES.contracts, icon: FileText, disabled: true },
        {
          label: "nav.documentArchive",
          href: ROUTES.documentArchive,
          icon: Archive,
          disabled: true,
        },
      ],
    },
    {
      title: "nav.sectionSystem",
      items: [
        { label: "nav.settings", href: ROUTES.settings, icon: Settings, disabled: true },
        {
          label: "nav.employees",
          href: ROUTES.employees,
          icon: UserCheck,
          requiredRole: "admin",
        },
      ],
    },
  ]
}

export const NAV: NavSection[] = createNavConfig()
export const NAV_ITEMS: NavItem[] = NAV.flatMap((s) => s.items)
