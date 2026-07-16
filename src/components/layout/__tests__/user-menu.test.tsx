import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock("@/features/auth/actions", () => ({ logoutAction: vi.fn() }))
vi.mock("@/stores", () => ({ useUserStore: vi.fn() }))

import { UserMenu } from "../user-menu"
import { logoutAction } from "@/features/auth/actions"
import { useUserStore } from "@/stores"
import { toast } from "sonner"

const mockUseUserStore = vi.mocked(useUserStore)
const mockToastSuccess = vi.mocked(toast.success)
const mockLogoutAction = vi.mocked(logoutAction)
const mockClearUser = vi.fn()

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUserStore.mockImplementation((selector) =>
      selector({ clearUser: mockClearUser } as never)
    )
  })

  it("clears the user, shows a logout success toast, and calls logoutAction on logout", async () => {
    const user = userEvent.setup()
    render(<UserMenu email="user@example.com" />)

    await user.click(screen.getByRole("button", { name: "userMenu.openLabel" }))
    await user.click(await screen.findByText("auth.logout"))

    expect(mockClearUser).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith("auth.logoutSuccess")
    expect(mockLogoutAction).toHaveBeenCalled()
  })
})
