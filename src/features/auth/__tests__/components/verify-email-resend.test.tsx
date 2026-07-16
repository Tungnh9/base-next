import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-auth")
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { VerifyEmailResend } from "../../components/verify-email-resend"
import { useResendVerificationEmailAction } from "../../hooks/use-auth"
import { toast } from "sonner"

const mockUseResendVerificationEmailAction = vi.mocked(useResendVerificationEmailAction)
const mockToastError = vi.mocked(toast.error)

describe("VerifyEmailResend", () => {
  const mockAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseResendVerificationEmailAction.mockReturnValue({
      state: {},
      action: mockAction,
      isPending: false,
    })
  })

  it("renders the resend button", () => {
    render(<VerifyEmailResend email="user@example.com" />)

    expect(screen.getByRole("button", { name: /resend/i })).toBeInTheDocument()
  })

  it("calls action with the email when resend is clicked", async () => {
    const user = userEvent.setup()
    render(<VerifyEmailResend email="user@example.com" />)

    await user.click(screen.getByRole("button", { name: /resend/i }))

    expect(mockAction).toHaveBeenCalled()
    const submittedFormData = mockAction.mock.calls[0][0] as FormData
    expect(submittedFormData.get("email")).toBe("user@example.com")
  })

  it("shows the success message once state.success is true", () => {
    mockUseResendVerificationEmailAction.mockReturnValue({
      state: { success: true },
      action: mockAction,
      isPending: false,
    })

    render(<VerifyEmailResend email="user@example.com" />)

    expect(screen.getByText("resendSuccess")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /resend/i })).not.toBeInTheDocument()
  })

  it("fires toast.error when the resend fails (previously silent)", async () => {
    mockUseResendVerificationEmailAction.mockReturnValue({
      state: { error: "resendFailed" },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<VerifyEmailResend email="user@example.com" />)
    })

    expect(mockToastError).toHaveBeenCalledWith("resendFailed")
  })
})
