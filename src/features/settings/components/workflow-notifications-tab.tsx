"use client"

import { NotificationCard } from "./notification-card"
import { WorkflowCard } from "./workflow-card"

function WorkflowNotificationsTab() {
  return (
    <div className="flex flex-col gap-6">
      <WorkflowCard />
      <NotificationCard />
    </div>
  )
}

export { WorkflowNotificationsTab }
