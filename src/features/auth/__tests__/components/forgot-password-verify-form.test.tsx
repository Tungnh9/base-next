import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-auth")
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

// setup.ts's global next/navigation mock creates a NEW push fn on every
// useRouter() call, so it can't be spied on from outside — override with a
// single stable mock for this file so navigation can be asserted on directly.
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/vi/test",
  useSearchParams: () => new URLSearchParams(),
}))

import { ForgotPasswordVerifyForm } from "../../components/forgot-password-verify-form"
import { useForgotPasswordVerifyAction, useForgotPasswordAction } from "../../hooks/use-auth"
import { toast } from "sonner"

const mockUseForgotPasswordVerifyAction = vi.mocked(useForgotPasswordVerifyAction)
const mockUseForgotPasswordAction = vi.mocked(useForgotPasswordAction)
const mockToastSuccess = vi.mocked(toast.success)
const mockToastError = vi.mocked(toast.error)

describe("ForgotPasswordVerifyForm", () => {
  const mockAction = vi.fn()
  const mockResendAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
    mockUseForgotPasswordVerifyAction.mockReturnValue({
      state: {},
      action: mockAction,
      isPending: false,
    })
    mockUseForgotPasswordAction.mockReturnValue({
      state: {},
      action: mockResendAction,
      isPending: false,
    })
  })

  it("renders the OTP input, submit button, and resend button", () => {
    render(<ForgotPasswordVerifyForm email="user@example.com" />)

    expect(screen.getByRole("button", { name: /verifyMyAccount/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /resend/i })).toBeInTheDocument()
  })

  it("disables the submit button until all 6 digits are entered", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordVerifyForm email="user@example.com" />)

    const submitButton = screen.getByRole("button", { name: /verifyMyAccount/i })
    expect(submitButton).toBeDisabled()

    const digitInputs = screen.getAllByRole("textbox")
    for (const [i, input] of digitInputs.entries()) {
      await user.type(input, String(i))
    }

    expect(submitButton).not.toBeDisabled()
  })

  it("calls resendAction with the email when the resend button is clicked", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordVerifyForm email="user@example.com" />)

    await user.click(screen.getByRole("button", { name: /resend/i }))

    expect(mockResendAction).toHaveBeenCalled()
    const submittedFormData = mockResendAction.mock.calls[0][0] as FormData
    expect(submittedFormData.get("email")).toBe("user@example.com")
  })

  it("shows the resend-success message once requiresEmailVerification is true", () => {
    mockUseForgotPasswordAction.mockReturnValue({
      state: { requiresEmailVerification: true },
      action: mockResendAction,
      isPending: false,
    })

    render(<ForgotPasswordVerifyForm email="user@example.com" />)

    expect(screen.getByText("resendSuccess")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /resend/i })).not.toBeInTheDocument()
  })

  it("navigates to reset-password with token and email on a successful verify", async () => {
    mockUseForgotPasswordVerifyAction.mockReturnValue({
      state: { success: true, resetToken: "demo-reset-token" },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<ForgotPasswordVerifyForm email="user@example.com" />)
    })

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("reset-password?token=demo-reset-token&email=user%40example.com")
    )
  })

  it("fires toast.success when the code is verified", async () => {
    mockUseForgotPasswordVerifyAction.mockReturnValue({
      state: { success: true, resetToken: "demo-reset-token" },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<ForgotPasswordVerifyForm email="user@example.com" />)
    })

    expect(mockToastSuccess).toHaveBeenCalledWith("codeVerifiedSuccess")
  })

  it("fires toast.error when the resend action fails (previously silent)", async () => {
    mockUseForgotPasswordAction.mockReturnValue({
      state: { error: "forgotPasswordFailed" },
      action: mockResendAction,
      isPending: false,
    })

    await act(async () => {
      render(<ForgotPasswordVerifyForm email="user@example.com" />)
    })

    expect(mockToastError).toHaveBeenCalledWith("forgotPasswordFailed")
  })
})
