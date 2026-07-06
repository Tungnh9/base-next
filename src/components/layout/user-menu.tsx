"use client"

import * as React from "react"
import { CreditCard, DollarSign, Info, LifeBuoy, LogOut, Settings, UserCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/features/auth/actions"

interface UserMenuProps {
  email: string
  role?: string
}

const itemClassName =
  "gap-2 rounded-[6px] px-4 py-[7px] text-[15px] text-foreground [&_svg]:text-foreground"

export function UserMenu({ email, role }: UserMenuProps) {
  const t = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus-visible:ring-ring rounded-full transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={t("userMenu.openLabel")}
        >
          <Avatar size={38} status="online">
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[230px] overflow-hidden p-0 py-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar size={38} status="online" className="shrink-0">
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-foreground truncate text-[15px] font-semibold">{email}</p>
            <p className="text-muted-foreground truncate text-[13px]">
              {role ?? t("userMenu.defaultRole")}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="flex flex-col gap-1 px-2">
          <DropdownMenuItem className={itemClassName}>
            <UserCheck className="size-[18px]" />
            {t("userMenu.myProfile")}
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClassName}>
            <Settings className="size-[18px]" />
            {t("userMenu.setting")}
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClassName}>
            <CreditCard className="size-[18px]" />
            <span className="flex-1">{t("userMenu.billing")}</span>
            <span className="bg-destructive/16 text-destructive flex size-[22px] items-center justify-center rounded-full text-[13px] font-semibold">
              2
            </span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="flex flex-col gap-1 px-2">
          <DropdownMenuItem className={itemClassName}>
            <LifeBuoy className="size-[18px]" />
            {t("userMenu.help")}
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClassName}>
            <Info className="size-[18px]" />
            {t("userMenu.faq")}
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClassName}>
            <DollarSign className="size-[18px]" />
            {t("userMenu.pricing")}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2">
          <form action={logoutAction} className="contents">
            <DropdownMenuItem
              asChild
              className={cn(
                itemClassName,
                "text-destructive [&_svg]:text-destructive hover:bg-destructive/10"
              )}
            >
              <button type="submit" className="w-full">
                <LogOut className="size-[18px]" />
                {t("auth.logout")}
              </button>
            </DropdownMenuItem>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
