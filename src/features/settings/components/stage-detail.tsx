"use client"

import { useTranslations } from "next-intl"

import type { ActionNodeType, ColorVariant, WorkflowStage } from "../types"
import { ActionNodePanel } from "./action-node-panel"
import { ActionPreviewStrip } from "./action-preview-strip"
import { StateListPanel } from "./state-list-panel"

interface StageDetailProps {
  stage: WorkflowStage
  onAddState: () => void
  onRemoveState: (stateId: string) => void
  onUpdateStateName: (stateId: string, name: string) => void
  onUpdateStateColor: (stateId: string, color: ColorVariant) => void
  onAddAction: () => void
  onRemoveAction: (actionId: string) => void
  onUpdateActionLabel: (actionId: string, label: string) => void
  onUpdateActionType: (actionId: string, type: ActionNodeType) => void
  onUpdateActionTarget: (actionId: string, targetStateId: string) => void
}

function StageDetail({
  stage,
  onAddState,
  onRemoveState,
  onUpdateStateName,
  onUpdateStateColor,
  onAddAction,
  onRemoveAction,
  onUpdateActionLabel,
  onUpdateActionType,
  onUpdateActionTarget,
}: StageDetailProps) {
  const t = useTranslations("settings.workflow")

  return (
    <div className="flex flex-col gap-6">
      <div className="lg:divide-border grid grid-cols-1 gap-6 lg:grid-cols-2 lg:divide-x">
        <StateListPanel
          className="lg:pr-6"
          states={stage.states}
          onAdd={onAddState}
          onRemove={onRemoveState}
          onUpdateName={onUpdateStateName}
          onUpdateColor={onUpdateStateColor}
        />
        <ActionNodePanel
          className="lg:pl-6"
          actions={stage.actions}
          states={stage.states}
          onAdd={onAddAction}
          onRemove={onRemoveAction}
          onUpdateLabel={onUpdateActionLabel}
          onUpdateType={onUpdateActionType}
          onUpdateTarget={onUpdateActionTarget}
        />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
          {t("previewLabel")}
        </p>
        <ActionPreviewStrip actions={stage.actions} />
      </div>
    </div>
  )
}

export { StageDetail }
