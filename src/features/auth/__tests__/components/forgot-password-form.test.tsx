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

import { ForgotPasswordForm } from "../../components/forgot-password-form"
import { useForgotPasswordAction } from "../../hooks/use-auth"
import { toast } from "sonner"

const mockUseForgotPasswordAction = vi.mocked(useForgotPasswordAction)
const mockToastSuccess = vi.mocked(toast.success)
const mockToastError = vi.mocked(toast.error)

describe("ForgotPasswordForm", () => {
  const mockAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
    mockUseForgotPasswordAction.mockReturnValue({ state: {}, action: mockAction, isPending: false })
  })

  it("renders the email input and submit button", () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByPlaceholderText("emailOrUsernamePlaceholder")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sendResetLink/i })).toBeInTheDocument()
  })

  it("fires toast.error when state.error is set", async () => {
    mockUseForgotPasswordAction.mockReturnValue({
      state: { error: "forgotPasswordFailed" },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<ForgotPasswordForm />)
    })

    expect(mockToastError).toHaveBeenCalledWith("forgotPasswordFailed")
  })

  it("fires toast.success and navigates to forgot-password-verify with the submitted email", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ForgotPasswordForm />)

    await user.type(screen.getByPlaceholderText("emailOrUsernamePlaceholder"), "user@example.com")
    await user.click(screen.getByRole("button", { name: /sendResetLink/i }))

    mockUseForgotPasswordAction.mockReturnValue({
      state: { requiresEmailVerification: true },
      action: mockAction,
      isPending: false,
    })
    await act(async () => {
      rerender(<ForgotPasswordForm />)
    })

    expect(mockToastSuccess).toHaveBeenCalledWith("resendSuccess")
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("forgot-password-verify?email=user%40example.com")
    )
  })
})
