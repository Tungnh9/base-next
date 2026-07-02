import { Bell, LayoutGrid, Search } from "lucide-react"
import { getLocale } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { getSession } from "@/lib/auth"
import type { Locale } from "@/i18n/config"
import { LanguageSwitcher } from "./language-switcher"
import { SidebarToggleButton } from "./sidebar-toggle-button"
import { UserMenu } from "./user-menu"

export async function Header() {
  const session = await getSession()
  const locale = (await getLocale()) as Locale

  return (
    <div className="sticky top-0 z-50 bg-background px-4 pt-4 sm:px-6 sm:pt-6">
      <header className="flex h-[62px] items-center gap-4 rounded-[6px] bg-card px-6 py-3 shadow-[0px_2px_4px_0px_rgba(165,163,174,0.3)]">
        <SidebarToggleButton />

        {/* Search */}
        <div className="hidden flex-1 items-center gap-2.5 sm:flex">
          <Search className="size-[22px] shrink-0 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search (Ctrl+/)"
            className="w-full bg-transparent text-[15px] text-muted-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Apps">
            <LayoutGrid className="size-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-[18px]" />
            <Badge
              variant="danger"
              skin="filled"
              className="absolute right-1 top-1 h-4 min-w-4 justify-center px-1 text-[10px] leading-none"
            >
              4
            </Badge>
          </Button>
          {session && <UserMenu email={session.email} role={session.role} />}
        </div>
      </header>
    </div>
  )
}
