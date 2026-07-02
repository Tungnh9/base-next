import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { getSession } from "@/lib/auth"
import { SidebarToggleButton } from "./sidebar-toggle-button"
import { UserMenu } from "./user-menu"

export async function Header() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-50 flex h-[60px] shrink-0 items-center gap-3 border-b bg-background px-4">
      <SidebarToggleButton />

      {/* Search */}
      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search (Ctrl+/)"
          className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground transition-colors focus:border-primary"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>
        {session && (
          <div className="ml-1">
            <UserMenu email={session.email} role={session.role} />
          </div>
        )}
      </div>
    </header>
  )
}
