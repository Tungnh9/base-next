"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/features/auth/actions"

interface UserMenuProps {
  email: string
  role?: string
}

export function UserMenu({ email, role }: UserMenuProps) {
  const t = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={t("userMenu.openLabel")}
        >
          <Avatar size={38} status="online">
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b px-3 py-3">
          <Avatar size={38} className="shrink-0">
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{email}</p>
            <p className="text-xs text-muted-foreground capitalize">{role ?? t("userMenu.defaultRole")}</p>
          </div>
        </div>
        <div className="py-2">
          <form action={logoutAction} className="contents">
            <DropdownMenuItem asChild variant="destructive">
              <button type="submit" className="w-full">
                <LogOut className="size-4" />
                {t("auth.logout")}
              </button>
            </DropdownMenuItem>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
