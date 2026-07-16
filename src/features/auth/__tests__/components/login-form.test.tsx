import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

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

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders email input, password input, and submit button", () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText("emailOrUsernamePlaceholder")).toBeInTheDocument()
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

  it("disables submit button and shows loggingIn text while isPending", () => {
    mockUseLoginAction.mockReturnValue({
      state: {},
      action: mockAction,
      isPending: true,
    })

    render(<LoginForm />)

    // t("loggingIn") → "loggingIn" in test env; AnimatedEllipsis adds dots after
    const submitButton = screen.getByRole("button", { name: /loggingIn/i })
    expect(submitButton).toBeDisabled()
  })

  it("toggles password visibility when eye button is clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByPlaceholderText("••••••")
    expect(passwordInput).toHaveAttribute("type", "password")

    // Button is inside aria-hidden span — use { hidden: true } to reach it
    await user.click(screen.getByRole("button", { hidden: true, name: /showPassword/i }))
    expect(passwordInput).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { hidden: true, name: /hidePassword/i }))
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("toggles the Remember Me checkbox", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const checkbox = screen.getByRole("checkbox", { name: /rememberMe/i })
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it("calls action with FormData on valid submit", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByPlaceholderText("emailOrUsernamePlaceholder"), "user@example.com")
    await user.type(screen.getByPlaceholderText("••••••"), "password123")
    await user.click(screen.getByRole("button", { name: /login/i }))

    expect(mockAction).toHaveBeenCalled()
  })

  it("disables the submit button and shows a countdown when rate-limited, then re-enables at zero", async () => {
    vi.useFakeTimers()
    mockUseLoginAction.mockReturnValue({
      state: { error: "tooManyAttempts", retryAfterMs: 90_000 },
      action: mockAction,
      isPending: false,
    })

    act(() => {
      render(<LoginForm />)
    })

    // t("tryAgainIn", {...}) → "tryAgainIn" in test env (mock ignores params)
    const button = screen.getByRole("button", { name: /tryAgainIn/i })
    expect(button).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(button).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(button).not.toBeDisabled()
  })
})
