"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "Buttons", slug: "buttons" },
  { label: "Form", slug: "form" },
  { label: "Display", slug: "display" },
  { label: "Feedback", slug: "feedback" },
  { label: "Navigation", slug: "navigation" },
  { label: "Overlay", slug: "overlay" },
]

export function UiTestNav() {
  const pathname = usePathname()
  const { locale } = useParams<{ locale: string }>()

  return (
    <nav className="sticky top-0 z-10 bg-background border-b flex flex-wrap gap-1 px-8 py-3">
      <span className="self-center mr-2 text-sm font-semibold text-foreground">UI Test</span>
      {TABS.map(tab => {
        const href = `/${locale}/ui-test/${tab.slug}`
        const isActive = pathname.includes(`/ui-test/${tab.slug}`)
        return (
          <Link
            key={tab.slug}
            href={href}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
