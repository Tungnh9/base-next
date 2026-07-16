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

import { RegisterForm } from "../../components/register-form"
import { useRegisterAction } from "../../hooks/use-auth"
import { toast } from "sonner"

const mockUseRegisterAction = vi.mocked(useRegisterAction)
const mockToastSuccess = vi.mocked(toast.success)
const mockToastError = vi.mocked(toast.error)

describe("RegisterForm", () => {
  const mockAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
    mockUseRegisterAction.mockReturnValue({ state: {}, action: mockAction, isPending: false })
  })

  it("renders username, email, password inputs and submit button", () => {
    render(<RegisterForm />)

    expect(screen.getByPlaceholderText("usernamePlaceholder")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("registerEmailPlaceholder")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /signUp/i })).toBeInTheDocument()
  })

  it("fires toast.error when state.error is set", async () => {
    mockUseRegisterAction.mockReturnValue({
      state: { error: "registerFailed" },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<RegisterForm />)
    })

    expect(mockToastError).toHaveBeenCalledWith("registerFailed")
  })

  it("fires toast.success and navigates to verify-email with the submitted email on success", async () => {
    const user = userEvent.setup()
    mockUseRegisterAction.mockReturnValue({ state: {}, action: mockAction, isPending: false })
    const { rerender } = render(<RegisterForm />)

    await user.type(screen.getByPlaceholderText("usernamePlaceholder"), "johndoe")
    await user.type(screen.getByPlaceholderText("registerEmailPlaceholder"), "user@example.com")
    await user.type(screen.getByPlaceholderText("••••••"), "password123")
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: /signUp/i }))

    mockUseRegisterAction.mockReturnValue({
      state: { success: true },
      action: mockAction,
      isPending: false,
    })
    await act(async () => {
      rerender(<RegisterForm />)
    })

    expect(mockToastSuccess).toHaveBeenCalledWith("registerSuccess")
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("verify-email?email=user%40example.com")
    )
  })
})
