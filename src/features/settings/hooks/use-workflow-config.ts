"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { getWorkflowConfig, saveWorkflowConfig } from "../actions"
import type { ActionNodeType, ColorVariant, WorkflowStage } from "../types"

let stateIdCounter = 0
function nextStateId() {
  stateIdCounter += 1
  return `new-state-${stateIdCounter}`
}

let actionIdCounter = 0
function nextActionId() {
  actionIdCounter += 1
  return `new-action-${actionIdCounter}`
}

function mapStage(
  stages: WorkflowStage[],
  stageId: string,
  updater: (stage: WorkflowStage) => WorkflowStage
) {
  return stages.map((stage) => (stage.id === stageId ? updater(stage) : stage))
}

export function useWorkflowConfig() {
  const t = useTranslations("settings.toast")
  const [stages, setStages] = useState<WorkflowStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getWorkflowConfig().then(({ data, error }) => {
      if (error) {
        toast.error(error.message)
      } else if (data) {
        setStages(data)
      }
      setIsLoading(false)
    })
  }, [])

  const addState = useCallback(
    (stageId: string) => {
      setStages((prev) =>
        mapStage(prev, stageId, (stage) => ({
          ...stage,
          states: [
            ...stage.states,
            { id: nextStateId(), name: t("newStateDefaultName"), color: "secondary" },
          ],
        }))
      )
    },
    [t]
  )

  // Removing a state must not leave any action's targetStateId dangling
  // (regression guard — a saved config with an orphaned targetStateId used
  // to render an unset/blank target Select with no indication of what broke).
  // Any action that targeted the removed state is reassigned to whichever
  // state ends up first, matching addAction()'s own default-target rule.
  const removeState = useCallback((stageId: string, stateId: string) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => {
        if (stage.states.length <= 1) return stage
        const remainingStates = stage.states.filter((s) => s.id !== stateId)
        const fallbackStateId = remainingStates[0]?.id ?? ""
        return {
          ...stage,
          states: remainingStates,
          actions: stage.actions.map((a) =>
            a.targetStateId === stateId ? { ...a, targetStateId: fallbackStateId } : a
          ),
        }
      })
    )
  }, [])

  const updateStateName = useCallback((stageId: string, stateId: string, name: string) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => ({
        ...stage,
        states: stage.states.map((s) => (s.id === stateId ? { ...s, name } : s)),
      }))
    )
  }, [])

  const updateStateColor = useCallback((stageId: string, stateId: string, color: ColorVariant) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => ({
        ...stage,
        states: stage.states.map((s) => (s.id === stateId ? { ...s, color } : s)),
      }))
    )
  }, [])

  const addAction = useCallback(
    (stageId: string) => {
      setStages((prev) =>
        mapStage(prev, stageId, (stage) => ({
          ...stage,
          actions: [
            ...stage.actions,
            {
              id: nextActionId(),
              label: t("newActionDefaultLabel"),
              type: "secondary" as ActionNodeType,
              targetStateId: stage.states[0]?.id ?? "",
            },
          ],
        }))
      )
    },
    [t]
  )

  const removeAction = useCallback((stageId: string, actionId: string) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => ({
        ...stage,
        actions:
          stage.actions.length > 1 ? stage.actions.filter((a) => a.id !== actionId) : stage.actions,
      }))
    )
  }, [])

  const updateActionLabel = useCallback((stageId: string, actionId: string, label: string) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => ({
        ...stage,
        actions: stage.actions.map((a) => (a.id === actionId ? { ...a, label } : a)),
      }))
    )
  }, [])

  const updateActionType = useCallback(
    (stageId: string, actionId: string, type: ActionNodeType) => {
      setStages((prev) =>
        mapStage(prev, stageId, (stage) => ({
          ...stage,
          actions: stage.actions.map((a) => (a.id === actionId ? { ...a, type } : a)),
        }))
      )
    },
    []
  )

  const updateActionTarget = useCallback(
    (stageId: string, actionId: string, targetStateId: string) => {
      setStages((prev) =>
        mapStage(prev, stageId, (stage) => ({
          ...stage,
          actions: stage.actions.map((a) => (a.id === actionId ? { ...a, targetStateId } : a)),
        }))
      )
    },
    []
  )

  const save = useCallback(async () => {
    setIsSaving(true)
    const { data, error } = await saveWorkflowConfig(stages)
    setIsSaving(false)
    if (error) {
      toast.error(error.message)
      return false
    }
    if (data) setStages(data)
    return true
  }, [stages])

  return {
    stages,
    isLoading,
    isSaving,
    addState,
    removeState,
    updateStateName,
    updateStateColor,
    addAction,
    removeAction,
    updateActionLabel,
    updateActionType,
    updateActionTarget,
    save,
  }
}
