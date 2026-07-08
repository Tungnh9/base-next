import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-auth")
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

const mockUseLoginAction = vi.mocked(useLoginAction)

describe("LoginForm", () => {
  const mockAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLoginAction.mockReturnValue({ state: {}, action: mockAction, isPending: false })
  })

  it("renders email input, password input, and submit button", () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText("john.doe")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
  })

  it("renders forgot-password and register links", () => {
    render(<LoginForm />)

    expect(screen.getByRole("link", { name: /forgotPassword/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /createAccount/i })).toBeInTheDocument()
  })

  it("shows error message when state.error is set", () => {
    mockUseLoginAction.mockReturnValue({
      state: { error: "loginFailed" },
      action: mockAction,
      isPending: false,
    })

    render(<LoginForm />)

    // t("loginFailed") returns "loginFailed" in test
    expect(screen.getByText("loginFailed")).toBeInTheDocument()
  })

  it("disables button and shows loading text when isPending", () => {
    mockUseLoginAction.mockReturnValue({
      state: {},
      action: mockAction,
      isPending: true,
    })

    render(<LoginForm />)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    // t("loading") returns "loading" in test
    expect(button).toHaveTextContent("loading")
  })

  it("calls action with FormData on valid submit", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByPlaceholderText("john.doe"), "user@example.com")
    await user.type(
      screen
        .getByRole("button", { name: /login/i })
        .closest("form")!
        .querySelector("input[type='password']")!,
      "password123"
    )
    await user.click(screen.getByRole("button", { name: /login/i }))

    expect(mockAction).toHaveBeenCalled()
  })
})
