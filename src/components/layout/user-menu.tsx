"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { logoutAction } from "@/features/auth/actions"

interface UserMenuProps {
  email: string
  role?: string
}

export function UserMenu({ email, role }: UserMenuProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:brightness-90 transition-all"
        aria-label="User menu"
        aria-expanded={open}
      >
        {email.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border bg-popover shadow-md z-50">
          <div className="flex items-center gap-3 border-b px-3 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">{email}</p>
              <p className="text-xs text-muted-foreground capitalize">{role ?? "User"}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
