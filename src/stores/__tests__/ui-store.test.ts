import { describe, it, expect, beforeEach } from "vitest"
import { useUiStore } from "../ui-store"

// Capture the pristine store (state + actions) once, before any test mutates
// it, so it can be restored wholesale between tests.
const initialState = useUiStore.getState()

describe("useUiStore", () => {
  beforeEach(() => {
    localStorage.clear()
    // Zustand stores are module singletons — reset in-memory state directly so
    // state/persistence from one test never leaks into the next. The `true`
    // replace flag avoids merging stale fields left over from a prior test
    // (replacing with a partial object would also wipe out the action
    // functions, so we restore the full captured state instead).
    useUiStore.setState(initialState, true)
  })

  it("has the expected initial state", () => {
    const state = useUiStore.getState()
    expect(state.sidebarCollapsed).toBe(false)
    expect(state.sidebarOpen).toBe(false)
  })

  it("toggleSidebarCollapsed flips sidebarCollapsed without affecting sidebarOpen", () => {
    useUiStore.getState().toggleSidebarCollapsed()
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
    expect(useUiStore.getState().sidebarOpen).toBe(false)

    useUiStore.getState().toggleSidebarCollapsed()
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })

  it("toggleSidebar flips sidebarOpen without affecting sidebarCollapsed", () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(true)
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)

    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it("setSidebarOpen sets sidebarOpen to the given value", () => {
    useUiStore.getState().setSidebarOpen(true)
    expect(useUiStore.getState().sidebarOpen).toBe(true)

    useUiStore.getState().setSidebarOpen(false)
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it("persists only sidebarCollapsed to localStorage — sidebarOpen is excluded (partialize)", () => {
    useUiStore.getState().toggleSidebarCollapsed()
    useUiStore.getState().setSidebarOpen(true)

    const raw = localStorage.getItem("ui-storage")
    expect(raw).not.toBeNull()

    const persisted = JSON.parse(raw as string)
    expect(persisted.state).toHaveProperty("sidebarCollapsed", true)
    expect(persisted.state).not.toHaveProperty("sidebarOpen")
  })
})
