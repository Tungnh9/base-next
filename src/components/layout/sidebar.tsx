"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { useTranslations } from "next-intl"
import { useUiStore } from "@/stores"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { NAV } from "@/config/nav"

export function Sidebar() {
  const pathname = usePathname()
  const { locale } = useParams<{ locale: string }>()
  const t = useTranslations()
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen, toggleSidebar, setSidebarOpen } =
    useUiStore()

  return (
    <>
      {/* Mobile hamburger — visible only when sidebar is hidden on small screens */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
          className="bg-sidebar fixed top-4 left-4 z-50 flex size-9 items-center justify-center rounded-md shadow-md lg:hidden"
        >
          <Menu className="text-sidebar-foreground size-5" />
        </button>
      )}
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "bg-sidebar sticky top-0 flex h-dvh shrink-0 flex-col shadow-[0px_2px_4px_0px_rgba(165,163,174,0.3)] transition-[width] duration-200 ease-in-out",
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto",
          sidebarOpen ? "flex" : "hidden lg:flex",
          sidebarCollapsed ? "w-[84px]" : "w-[260px]"
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex shrink-0 items-center py-4",
            sidebarCollapsed
              ? "justify-center px-[18px]"
              : "justify-between py-5 pr-[14px] pl-[18px]"
          )}
        >
          {sidebarCollapsed ? (
            <button
              onClick={toggleSidebarCollapsed}
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent flex size-5 cursor-pointer items-center justify-center rounded-full border transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="size-3" />
            </button>
          ) : (
            <>
              <Link
                href={`/${locale}`}
                className="text-sidebar-foreground flex items-center gap-2 text-[22px] leading-6 font-bold"
              >
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={34}
                  height={23}
                  priority
                  className="h-[23px] w-[34px]"
                />
                <span>Vuexy</span>
              </Link>
              <button
                onClick={toggleSidebarCollapsed}
                className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent flex size-5 cursor-pointer items-center justify-center rounded-full border transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="size-3" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map((section, i) => (
            <div key={i} className="mt-2">
              {section.title &&
                (sidebarCollapsed ? (
                  <Separator className="mx-auto my-3 w-6" />
                ) : (
                  <p className="text-muted-foreground px-[30px] pt-5 pb-1.5 text-[11px] uppercase">
                    {t(section.title as never)}
                  </p>
                ))}
              <ul className="flex flex-col gap-1 px-3.5">
                {section.items.map((item) => {
                  const href = `/${locale}${item.href}`
                  const isActive = pathname === href || pathname.startsWith(href + "/")
                  const label = t(item.label as never)
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        title={sidebarCollapsed ? label : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-[6px] py-[9px] text-[15px] transition-colors",
                          sidebarCollapsed ? "justify-center px-[10px]" : "px-4",
                          isActive
                            ? "text-sidebar-primary-foreground bg-[linear-gradient(29deg,var(--color-sidebar-primary)_22%,color-mix(in_srgb,var(--color-sidebar-primary)_70%,transparent)_76%)] shadow-[0px_2px_6px_0px_color-mix(in_srgb,var(--color-sidebar-primary)_48%,transparent)]"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="size-[22px] shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 truncate">{label}</span>
                            {item.badge !== undefined && (
                              <span className="bg-sidebar-primary/16 text-sidebar-primary flex size-[22px] items-center justify-center rounded-full text-[13px] font-semibold">
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
    </>
  )
}
