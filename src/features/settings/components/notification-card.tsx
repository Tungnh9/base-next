"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle, CardItem } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { MOCK_NOTIFICATION_SETTINGS } from "../mock-data"
import type { NotificationSetting } from "../types"

function NotificationCard() {
  const t = useTranslations("settings.notifications")
  const [rows, setRows] = useState<NotificationSetting[]>(MOCK_NOTIFICATION_SETTINGS)

  const toggle = (id: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, enabled: !row.enabled } : row)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cardTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="gap-0 p-0">
        {rows.map((row) => (
          <CardItem key={row.id} className="flex items-center justify-between">
            <span className="text-foreground text-sm">{t(`items.${row.labelKey}`)}</span>
            <Switch
              color="primary"
              checked={row.enabled}
              onCheckedChange={() => toggle(row.id)}
              aria-label={t(`items.${row.labelKey}`)}
            />
          </CardItem>
        ))}
      </CardContent>
    </Card>
  )
}

export { NotificationCard }
