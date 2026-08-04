"use client"

import { Button } from "@/components/ui/button"
import { ACTION_NODE_TYPE_META, type ActionNode } from "../types"

interface ActionPreviewStripProps {
  actions: ActionNode[]
}

function ActionPreviewStrip({ actions }: ActionPreviewStripProps) {
  return (
    <div className="border-border bg-muted/30 flex flex-wrap items-center gap-3 rounded-[10px] border p-4">
      {actions.map((action) => {
        const meta = ACTION_NODE_TYPE_META[action.type]
        return (
          <Button key={action.id} type="button" variant={meta.variant} skin={meta.skin} size="sm">
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}

export { ActionPreviewStrip }
