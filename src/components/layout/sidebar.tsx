"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useUiStore } from "@/stores"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Apps & Pages",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart2 },
      { label: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUiStore()

  if (!sidebarOpen) return null

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex h-[60px] shrink-0 items-center border-b border-sidebar-border px-4",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {sidebarCollapsed ? (
          <button
            onClick={toggleSidebarCollapsed}
            className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="size-4" />
          </button>
        ) : (
          <>
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-sidebar-foreground"
            >
              <LayoutDashboard className="size-5 shrink-0 text-sidebar-primary" />
              <span>App</span>
            </Link>
            <button
              onClick={toggleSidebarCollapsed}
              className="flex size-6 items-center justify-center rounded-full border border-sidebar-border text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((section, i) => (
          <div
            key={i}
            className={cn(i > 0 ? "mt-4" : "mt-2")}
          >
            {!sidebarCollapsed && section.title && (
              <p className="mx-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.title}
              </p>
            )}
            <ul className={cn("flex flex-col gap-0.5", sidebarCollapsed ? "px-2" : "px-3")}>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors",
                        sidebarCollapsed ? "justify-center px-2" : "px-3",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="size-[18px] shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
