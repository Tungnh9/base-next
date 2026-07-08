import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-auth")
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
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

import { LoginForm } from "../../components/login-form"
import { useLoginAction } from "../../hooks/use-auth"
import { toast } from "sonner"

const mockUseLoginAction = vi.mocked(useLoginAction)
const mockToastError = vi.mocked(toast.error)

describe("LoginForm", () => {
  const mockAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLoginAction.mockReturnValue({ state: {}, action: mockAction, isPending: false })
  })

  it("renders email input, password input, and submit button", () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText("john.doe")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("••••••")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
  })

  it("renders forgot-password and register links", () => {
    render(<LoginForm />)

    expect(screen.getByRole("link", { name: /forgotPassword/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /createAccount/i })).toBeInTheDocument()
  })

  it("fires toast.error when state.error is set", async () => {
    mockUseLoginAction.mockReturnValue({
      state: { error: "loginFailed" },
      action: mockAction,
      isPending: false,
    })

    await act(async () => {
      render(<LoginForm />)
    })

    // t("loginFailed") returns "loginFailed" in test env
    expect(mockToastError).toHaveBeenCalledWith("loginFailed")
  })

  it("disables button and shows loading text when isPending", () => {
    mockUseLoginAction.mockReturnValue({
      state: {},
      action: mockAction,
      isPending: true,
    })

    render(<LoginForm />)

    // Both submit button and eye-toggle exist; the submit button is disabled
    const submitButton = screen.getByRole("button", { name: /loading/i })
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent("loading")
  })

  it("toggles password visibility when eye button is clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByPlaceholderText("••••••")
    expect(passwordInput).toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: /showPassword/i }))
    expect(passwordInput).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: /hidePassword/i }))
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("calls action with FormData on valid submit", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByPlaceholderText("john.doe"), "user@example.com")
    await user.type(screen.getByPlaceholderText("••••••"), "password123")
    await user.click(screen.getByRole("button", { name: /login/i }))

    expect(mockAction).toHaveBeenCalled()
  })
})
