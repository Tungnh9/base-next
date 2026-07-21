import { describe, it, expect, beforeEach } from "vitest"
import { useUserStore } from "../user-store"
import type { User } from "@/features/auth/types"

// Capture the pristine store (state + actions) once, before any test mutates
// it, so it can be restored wholesale between tests.
const initialState = useUserStore.getState()

const mockUser: User = {
  id: "1",
  email: "user@example.com",
  name: "Nguyễn Văn An",
  role: "user",
  createdAt: "2026-01-01T00:00:00.000Z",
}

describe("useUserStore", () => {
  beforeEach(() => {
    localStorage.clear()
    // Module-singleton store — reset in-memory state directly (replace flag)
    // so no test leaks state/persistence into the next one.
    useUserStore.setState(initialState, true)
  })

  it("has the expected initial state", () => {
    expect(useUserStore.getState().user).toBeNull()
  })

  it("setUser stores the given user", () => {
    useUserStore.getState().setUser(mockUser)
    expect(useUserStore.getState().user).toEqual(mockUser)
  })

  it("clearUser resets user back to null", () => {
    useUserStore.getState().setUser(mockUser)
    useUserStore.getState().clearUser()
    expect(useUserStore.getState().user).toBeNull()
  })

  it("persists the FULL user object to localStorage — no partialize, unlike ui-store", () => {
    useUserStore.getState().setUser(mockUser)

    const raw = localStorage.getItem("user-storage")
    expect(raw).not.toBeNull()

    const persisted = JSON.parse(raw as string)
    expect(persisted.state.user).toEqual(mockUser)
  })
})
