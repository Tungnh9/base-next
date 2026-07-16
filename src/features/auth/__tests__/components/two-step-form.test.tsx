import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-auth")
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/vi/test",
  useSearchParams: () => new URLSearchParams(),
}))

import { TwoStepForm } from "../../components/two-step-form"
import { useTwoStepVerificationAction, useResendTwoStepAction } from "../../hooks/use-auth"
import { toast } from "sonner"

const mockUseTwoStepVerificationAction = vi.mocked(useTwoStepVerificationAction)
const mockUseResendTwoStepAction = vi.mocked(useResendTwoStepAction)
const mockToastSuccess = vi.mocked(toast.success)
const mockToastError = vi.mocked(toast.error)

describe("TwoStepForm", () => {
  const mockAction = vi.fn()
  const mockResendAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
    mockUseTwoStepVerificationAction.mockReturnValue({
      state: {},
      action: mockAction,
      isPending: false,
    })
    mockUseResendTwoStepAction.mockReturnValue({
      state: {},
      action: mockResendAction,
      isPending: false,
    })
  })

  it("renders the OTP input and resend button", () => {
    render(<TwoStepForm />)

    expect(screen.getByRole("button", { name: /verifyMyAccount/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /resend/i })).toBeInTheDocument()
  })

  it("fires toast.success and navigates to dashboard when verification succeeds", async () => {
    mockUseTwoStepVerificationAction.mockReturnValue({
      state: { success: true, user: { id: "1" } as never },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<TwoStepForm />)
    })

    expect(mockToastSuccess).toHaveBeenCalledWith("loginSuccess")
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/dashboard"))
  })

  it("fires toast.error when the resend action fails (previously silent)", async () => {
    mockUseResendTwoStepAction.mockReturnValue({
      state: { error: "resendFailed" },
      action: mockResendAction,
      isPending: false,
    })

    await act(async () => {
      render(<TwoStepForm />)
    })

    expect(mockToastError).toHaveBeenCalledWith("resendFailed")
  })

  it("calls resendAction when the resend button is clicked", async () => {
    const user = userEvent.setup()
    render(<TwoStepForm />)

    await user.click(screen.getByRole("button", { name: /resend/i }))

    expect(mockResendAction).toHaveBeenCalled()
  })
})
