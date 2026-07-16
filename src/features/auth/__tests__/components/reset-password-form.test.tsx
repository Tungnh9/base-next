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

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

import { ResetPasswordForm } from "../../components/reset-password-form"
import { useResetPasswordAction } from "../../hooks/use-auth"
import { toast } from "sonner"

const mockUseResetPasswordAction = vi.mocked(useResetPasswordAction)
const mockToastSuccess = vi.mocked(toast.success)

describe("ResetPasswordForm", () => {
  const mockAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
    mockUseResetPasswordAction.mockReturnValue({ state: {}, action: mockAction, isPending: false })
  })

  it("renders the password strength meter", () => {
    render(<ResetPasswordForm token="demo-reset-token" />)

    expect(screen.getByText("passwordStrengthLabel")).toBeInTheDocument()
    expect(screen.getByText("passwordReqMinLength")).toBeInTheDocument()
  })

  it("shows the security tip callout", () => {
    render(<ResetPasswordForm token="demo-reset-token" />)

    expect(screen.getByText("securityTipTitle:")).toBeInTheDocument()
    expect(screen.getByText("securityTipBody")).toBeInTheDocument()
  })

  it("does not show the confirm-match message until both passwords match", async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm token="demo-reset-token" />)

    expect(screen.queryByText("passwordConfirmMatch")).not.toBeInTheDocument()

    await user.type(screen.getByLabelText("newPassword"), "Abcdefg1!")
    expect(screen.queryByText("passwordConfirmMatch")).not.toBeInTheDocument()

    await user.type(screen.getByLabelText("confirmPassword"), "Abcdefg1!")
    expect(screen.getByText("passwordConfirmMatch")).toBeInTheDocument()
  })

  it("shows a success toast and navigates to login when the reset succeeds", async () => {
    mockUseResetPasswordAction.mockReturnValue({
      state: { success: true },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<ResetPasswordForm token="demo-reset-token" />)
    })

    expect(mockToastSuccess).toHaveBeenCalledWith("resetPasswordSuccess")
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/login"))
  })
})
