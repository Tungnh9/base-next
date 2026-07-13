import { getLocale } from "next-intl/server"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { getSession } from "@/lib/auth"
import type { Locale } from "@/i18n/config"
import { LanguageSwitcher } from "./language-switcher"
import { NotificationDropdown } from "./notification-dropdown"
import { SearchBox } from "./search-box"
import { ShortcutsDropdown } from "./shortcuts-dropdown"
import { UserMenu } from "./user-menu"

export async function Header() {
  const [session, rawLocale] = await Promise.all([getSession(), getLocale()])
  const locale = rawLocale as Locale

  return (
    <div className="bg-background sticky top-4 z-50">
      <header className="bg-card flex h-[62px] items-center gap-4 rounded-[6px] px-6 py-3 shadow-[0px_2px_4px_0px_rgba(165,163,174,0.3)]">
        <SearchBox />

        {/* Right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
          <ShortcutsDropdown />
          <NotificationDropdown />
          {session && (
            <UserMenu email={session.email} name={session.name} role={session.role} avatar="/images/avatars/avt1.png" />
          )}
        </div>
      </header>
    </div>
  )
}
