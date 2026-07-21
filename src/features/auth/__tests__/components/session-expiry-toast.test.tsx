import { render } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("sonner", () => ({ toast: { warning: vi.fn(), success: vi.fn() } }))
vi.mock("@/features/auth/actions", () => ({ logoutAction: vi.fn() }))
vi.mock("@/stores", () => ({ useUserStore: vi.fn() }))
vi.mock("../../hooks/use-session-expiry", () => ({ useSessionExpiryWarning: vi.fn() }))

import { SessionExpiryToast } from "../../components/session-expiry-toast"
import { useSessionExpiryWarning } from "../../hooks/use-session-expiry"
import { logoutAction } from "@/features/auth/actions"
import { useUserStore } from "@/stores"
import { toast } from "sonner"

const mockUseSessionExpiryWarning = vi.mocked(useSessionExpiryWarning)
const mockToastWarning = vi.mocked(toast.warning)
const mockToastSuccess = vi.mocked(toast.success)
const mockLogoutAction = vi.mocked(logoutAction)
const mockClearUser = vi.fn()

describe("SessionExpiryToast", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUserStore).mockImplementation((selector) =>
      selector({ clearUser: mockClearUser } as never)
    )
  })

  it("renders nothing", () => {
    const { container } = render(<SessionExpiryToast exp={600} />)

    expect(container).toBeEmptyDOMElement()
  })

  it("wires exp through to useSessionExpiryWarning", () => {
    render(<SessionExpiryToast exp={600} />)

    expect(mockUseSessionExpiryWarning).toHaveBeenCalledWith(600, expect.any(Function))
  })

  it("shows a warning toast with a logout action when the hook fires", () => {
    render(<SessionExpiryToast exp={600} />)

    const onExpiringSoon = mockUseSessionExpiryWarning.mock.calls[0][1]
    onExpiringSoon()

    expect(mockToastWarning).toHaveBeenCalledWith(
      "title",
      expect.objectContaining({
        description: "description",
        action: expect.objectContaining({ label: "logoutNow" }),
      })
    )
  })

  it("clears the user, shows a logout success toast, and calls logoutAction when the toast action is clicked", () => {
    render(<SessionExpiryToast exp={600} />)

    const onExpiringSoon = mockUseSessionExpiryWarning.mock.calls[0][1]
    onExpiringSoon()

    const toastCall = mockToastWarning.mock.calls[0][1] as {
      action: { onClick: () => void }
    }
    toastCall.action.onClick()

    expect(mockClearUser).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith("logoutSuccess")
    expect(mockLogoutAction).toHaveBeenCalled()
  })
})
