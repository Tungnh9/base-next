"use client"

import { useCallback, useState } from "react"

import { MOCK_WORKFLOW_STAGES } from "../mock-data"
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
  const [stages, setStages] = useState<WorkflowStage[]>(MOCK_WORKFLOW_STAGES)

  const addState = useCallback((stageId: string) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => ({
        ...stage,
        states: [
          ...stage.states,
          { id: nextStateId(), name: "Trạng thái mới", color: "secondary" },
        ],
      }))
    )
  }, [])

  const removeState = useCallback((stageId: string, stateId: string) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => ({
        ...stage,
        states:
          stage.states.length > 1 ? stage.states.filter((s) => s.id !== stateId) : stage.states,
      }))
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

  const addAction = useCallback((stageId: string) => {
    setStages((prev) =>
      mapStage(prev, stageId, (stage) => ({
        ...stage,
        actions: [
          ...stage.actions,
          {
            id: nextActionId(),
            label: "Nút mới",
            type: "secondary" as ActionNodeType,
            targetStateId: stage.states[0]?.id ?? "",
          },
        ],
      }))
    )
  }, [])

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

  return {
    stages,
    addState,
    removeState,
    updateStateName,
    updateStateColor,
    addAction,
    removeAction,
    updateActionLabel,
    updateActionType,
    updateActionTarget,
  }
}
