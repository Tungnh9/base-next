import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../../actions", () => ({
  getWorkflowConfig: vi.fn(),
  saveWorkflowConfig: vi.fn(),
}))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { useWorkflowConfig } from "../use-workflow-config"
import { getWorkflowConfig, saveWorkflowConfig } from "../../actions"
import { toast } from "sonner"
import type { WorkflowStage } from "../../types"

const mockGetConfig = vi.mocked(getWorkflowConfig)
const mockSaveConfig = vi.mocked(saveWorkflowConfig)
const mockToastError = vi.mocked(toast.error)

const baseStage: WorkflowStage = {
  id: "stage-1",
  key: "salesOpportunities",
  order: 1,
  enabled: true,
  states: [
    { id: "s1", name: "State 1", color: "primary" },
    { id: "s2", name: "State 2", color: "secondary" },
  ],
  actions: [{ id: "a1", label: "Action 1", type: "primary", targetStateId: "s2" }],
}

describe("useWorkflowConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConfig.mockResolvedValue({ data: [baseStage], error: null })
  })

  it("starts loading then populates stages from getWorkflowConfig", async () => {
    const { result } = renderHook(() => useWorkflowConfig())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.stages).toEqual([baseStage])
  })

  it("toasts an error when getWorkflowConfig fails", async () => {
    mockGetConfig.mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })

    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockToastError).toHaveBeenCalledWith("boom")
  })

  it("addState uses the translated default name", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.addState("stage-1"))

    const stage = result.current.stages[0]
    const newState = stage.states.at(-1)
    expect(newState?.name).toBe("newStateDefaultName")
  })

  it("addAction uses the translated default label", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.addAction("stage-1"))

    const stage = result.current.stages[0]
    const newAction = stage.actions.at(-1)
    expect(newAction?.label).toBe("newActionDefaultLabel")
  })

  it("updateStateName/updateStateColor edit only the targeted state", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.updateStateName("stage-1", "s1", "Renamed"))
    act(() => result.current.updateStateColor("stage-1", "s1", "danger"))

    const [s1, s2] = result.current.stages[0].states
    expect(s1).toEqual({ id: "s1", name: "Renamed", color: "danger" })
    expect(s2).toEqual({ id: "s2", name: "State 2", color: "secondary" })
  })

  it("updateActionLabel/updateActionType/updateActionTarget edit only the targeted action", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.updateActionLabel("stage-1", "a1", "Renamed action"))
    act(() => result.current.updateActionType("stage-1", "a1", "danger"))
    act(() => result.current.updateActionTarget("stage-1", "a1", "s1"))

    expect(result.current.stages[0].actions[0]).toEqual({
      id: "a1",
      label: "Renamed action",
      type: "danger",
      targetStateId: "s1",
    })
  })

  it("removeAction removes the targeted action, but does nothing when it's the last one", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.addAction("stage-1"))
    expect(result.current.stages[0].actions).toHaveLength(2)

    act(() => result.current.removeAction("stage-1", "a1"))
    expect(result.current.stages[0].actions.map((a) => a.id)).not.toContain("a1")
    expect(result.current.stages[0].actions).toHaveLength(1)

    const lastActionId = result.current.stages[0].actions[0].id
    act(() => result.current.removeAction("stage-1", lastActionId))
    expect(result.current.stages[0].actions).toHaveLength(1)
  })

  it("removeState reassigns any action that targeted the removed state instead of leaving it dangling (regression guard)", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // baseStage's only action targets "s2" — removing s2 must not leave it
    // pointing at a state that no longer exists.
    act(() => result.current.removeState("stage-1", "s2"))

    const stage = result.current.stages[0]
    expect(stage.states.map((s) => s.id)).toEqual(["s1"])
    expect(stage.actions[0].targetStateId).toBe("s1")
  })

  it("removeState does nothing when it's the last remaining state", async () => {
    const singleStateStage: WorkflowStage = {
      ...baseStage,
      states: [{ id: "s1", name: "Only state", color: "primary" }],
      actions: [{ id: "a1", label: "Action 1", type: "primary", targetStateId: "s1" }],
    }
    mockGetConfig.mockResolvedValue({ data: [singleStateStage], error: null })

    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.removeState("stage-1", "s1"))

    expect(result.current.stages[0].states).toHaveLength(1)
  })

  it("save() calls saveWorkflowConfig with the current stages and returns true on success", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockSaveConfig.mockResolvedValue({ data: [baseStage], error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.save()
    })

    expect(ok).toBe(true)
    expect(mockSaveConfig).toHaveBeenCalledWith([baseStage])
  })

  it("save() toasts the error and returns false on failure", async () => {
    const { result } = renderHook(() => useWorkflowConfig())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockSaveConfig.mockResolvedValue({
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.save()
    })

    expect(ok).toBe(false)
    expect(mockToastError).toHaveBeenCalledWith("Dữ liệu không hợp lệ")
  })
})
