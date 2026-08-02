"use client"

import { useTranslations } from "next-intl"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersPermissionsTab } from "./users-permissions-tab"
import { WorkflowNotificationsTab } from "./workflow-notifications-tab"

function SettingsPage() {
  const t = useTranslations("settings")

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">{t("description")}</p>
      </div>
      <Tabs defaultValue="workflow">
        <TabsList>
          <TabsTrigger value="workflow">{t("tabs.workflow")}</TabsTrigger>
          <TabsTrigger value="users">{t("tabs.usersPermissions")}</TabsTrigger>
        </TabsList>
        <TabsContent value="workflow">
          <WorkflowNotificationsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersPermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { SettingsPage }
