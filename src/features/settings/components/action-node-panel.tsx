"use client"

import { useTranslations } from "next-intl"
import { ArrowRight, Plus, Trash2, Zap } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ActionNode, ActionNodeType, StageState } from "../types"

const ACTION_TYPES: ActionNodeType[] = ["primary", "secondary", "success", "danger"]

interface ActionNodePanelProps {
  className?: string
  actions: ActionNode[]
  states: StageState[]
  onAdd: () => void
  onRemove: (actionId: string) => void
  onUpdateLabel: (actionId: string, label: string) => void
  onUpdateType: (actionId: string, type: ActionNodeType) => void
  onUpdateTarget: (actionId: string, targetStateId: string) => void
}

function ActionNodePanel({
  className,
  actions,
  states,
  onAdd,
  onRemove,
  onUpdateLabel,
  onUpdateType,
  onUpdateTarget,
}: ActionNodePanelProps) {
  const t = useTranslations("settings.workflow")

  return (
    <div className={className}>
      <div className="text-foreground mb-3 flex items-center gap-2 text-[15px] font-semibold">
        <Zap className="text-secondary size-[18px]" />
        {t("actionsTitle", { count: actions.length })}
      </div>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <div
            key={action.id}
            className="border-border bg-muted/50 flex items-center gap-2 rounded-[8px] border p-3"
          >
            <Input
              size="sm"
              value={action.label}
              onChange={(e) => onUpdateLabel(action.id, e.target.value)}
              className="min-w-0 flex-1"
            />
            <Select
              value={action.type}
              onValueChange={(value) => onUpdateType(action.id, value as ActionNodeType)}
            >
              <SelectTrigger size="sm" className="w-[132px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`actionTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ArrowRight className="text-muted-foreground size-4 shrink-0" />
            <Select
              value={action.targetStateId}
              onValueChange={(value) => onUpdateTarget(action.id, value)}
            >
              <SelectTrigger size="sm" className="w-[132px] shrink-0">
                <SelectValue placeholder={t("targetStatePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {actions.length > 1 && (
              <button
                type="button"
                aria-label={t("removeAction")}
                onClick={() => onRemove(action.id)}
                className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="text-primary mt-3 flex items-center gap-1.5 text-[13px] font-medium hover:underline"
      >
        <Plus className="size-4" />
        {t("addAction")}
      </button>
    </div>
  )
}

export { ActionNodePanel }
