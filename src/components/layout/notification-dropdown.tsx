"use client"

import * as React from "react"
import { Bell, MailOpen, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NotificationKey = "achievement" | "connection" | "report"

interface NotificationItem {
  id: string
  key: NotificationKey
  read?: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "1", key: "achievement" },
  { id: "2", key: "connection", read: true },
  { id: "3", key: "report" },
]

export function NotificationDropdown() {
  const t = useTranslations()
  const [notifications, setNotifications] = React.useState(INITIAL_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("notifications.openLabel")}
          className="text-muted-foreground hover:text-foreground relative flex size-[26px] cursor-pointer items-center justify-center transition-colors"
        >
          <Bell className="size-[22px]" />
          {unreadCount > 0 && (
            <span className="bg-destructive absolute -top-1 -right-1 flex size-[18px] items-center justify-center rounded-full text-[11px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-foreground text-[18px] font-semibold">
            {t("notifications.title")}
          </span>
          <button
            type="button"
            onClick={markAllRead}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("notifications.markAllRead")}
          >
            <MailOpen className="size-[22px]" />
          </button>
        </div>
        <div className="divide-border max-h-[360px] divide-y overflow-y-auto border-t">
          {notifications.map((n) => {
            const title = t(`notifications.demo.${n.key}.title`)
            return (
              <div key={n.id} className="flex items-start gap-2.5 px-6 py-4">
                <Avatar size={38}>
                  <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-[15px] font-semibold">{title}</p>
                  <p className="text-muted-foreground truncate text-[13px]">
                    {t(`notifications.demo.${n.key}.description`)}
                  </p>
                  <p className="text-muted-foreground/70 text-[13px]">
                    {t(`notifications.demo.${n.key}.time`)}
                  </p>
                </div>
                {n.read ? (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground mt-1 shrink-0 transition-colors"
                    aria-label={t("notifications.dismiss")}
                    onClick={() => dismiss(n.id)}
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <span
                    className="bg-primary mt-1.5 size-2.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </div>
        <button
          type="button"
          className="text-primary w-full border-t px-6 py-2.5 text-center text-[15px] transition-colors hover:underline"
        >
          {t("notifications.viewAll")}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
