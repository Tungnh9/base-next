"use client"

import { useTranslations } from "next-intl"
import { Library, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DotStack } from "@/components/ui/dot-stack"
import { Input } from "@/components/ui/input"
import type { ColorVariant, StageState } from "../types"

interface StateListPanelProps {
  className?: string
  states: StageState[]
  onAdd: () => void
  onRemove: (stateId: string) => void
  onUpdateName: (stateId: string, name: string) => void
  onUpdateColor: (stateId: string, color: ColorVariant) => void
}

function StateListPanel({
  className,
  states,
  onAdd,
  onRemove,
  onUpdateName,
  onUpdateColor,
}: StateListPanelProps) {
  const t = useTranslations("settings.workflow")

  return (
    <div className={className}>
      <div className="text-foreground mb-3 flex items-center gap-2 text-[15px] font-semibold">
        <Library className="text-secondary size-[18px]" />
        {t("statesTitle", { count: states.length })}
      </div>
      <div className="flex flex-col gap-2">
        {states.map((state) => (
          <div
            key={state.id}
            className="border-border bg-muted/50 flex items-center gap-3 rounded-[8px] border p-3"
          >
            <DotStack value={state.color} onChange={(color) => onUpdateColor(state.id, color)} />
            <Input
              size="sm"
              value={state.name}
              onChange={(e) => onUpdateName(state.id, e.target.value)}
              className="min-w-0 flex-1"
            />
            <Badge variant={state.color} skin="light" size="sm" className="shrink-0">
              {state.name}
            </Badge>
            {states.length > 1 && (
              <button
                type="button"
                aria-label={t("removeState")}
                onClick={() => onRemove(state.id)}
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
        {t("addState")}
      </button>
    </div>
  )
}

export { StateListPanel }
