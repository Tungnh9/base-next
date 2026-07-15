import { renderHook, act, waitFor } from "@testing-library/react"
import { startTransition } from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import. Each *Action export is
// mocked directly (not the whole services/api layer) so useActionState's own
// wiring — the part that's never actually executed when component tests mock
// the hook itself — runs for real here.
vi.mock("../../actions", () => ({
  loginAction: vi.fn(),
  registerAction: vi.fn(),
  forgotPasswordAction: vi.fn(),
  verifyForgotPasswordCodeAction: vi.fn(),
  resetPasswordAction: vi.fn(),
  twoStepVerificationAction: vi.fn(),
  resendVerificationEmailAction: vi.fn(),
  resendTwoStepCodeAction: vi.fn(),
}))

import * as actions from "../../actions"
import {
  useLoginAction,
  useRegisterAction,
  useForgotPasswordAction,
  useForgotPasswordVerifyAction,
  useResetPasswordAction,
  useTwoStepVerificationAction,
  useResendVerificationEmailAction,
  useResendTwoStepAction,
} from "../../hooks/use-auth"

const HOOKS = [
  { name: "useLoginAction", hook: useLoginAction, actionMock: actions.loginAction },
  { name: "useRegisterAction", hook: useRegisterAction, actionMock: actions.registerAction },
  {
    name: "useForgotPasswordAction",
    hook: useForgotPasswordAction,
    actionMock: actions.forgotPasswordAction,
  },
  {
    name: "useForgotPasswordVerifyAction",
    hook: useForgotPasswordVerifyAction,
    actionMock: actions.verifyForgotPasswordCodeAction,
  },
  {
    name: "useResetPasswordAction",
    hook: useResetPasswordAction,
    actionMock: actions.resetPasswordAction,
  },
  {
    name: "useTwoStepVerificationAction",
    hook: useTwoStepVerificationAction,
    actionMock: actions.twoStepVerificationAction,
  },
  {
    name: "useResendVerificationEmailAction",
    hook: useResendVerificationEmailAction,
    actionMock: actions.resendVerificationEmailAction,
  },
  {
    name: "useResendTwoStepAction",
    hook: useResendTwoStepAction,
    actionMock: actions.resendTwoStepCodeAction,
  },
] as const

describe.each(HOOKS)("$name", ({ hook, actionMock }) => {
  beforeEach(() => vi.clearAllMocks())

  it("returns empty initial state and isPending=false before any submission", () => {
    const { result } = renderHook(() => hook())

    expect(result.current.state).toEqual({})
    expect(result.current.isPending).toBe(false)
  })

  it("calls the underlying Server Action and updates state to its resolved value", async () => {
    vi.mocked(actionMock).mockResolvedValue({ success: true } as never)

    const { result } = renderHook(() => hook())

    await act(async () => {
      result.current.action(new FormData())
    })

    await waitFor(() => expect(result.current.state).toEqual({ success: true }))
    expect(actionMock).toHaveBeenCalledOnce()
    expect(result.current.isPending).toBe(false)
  })
})

describe("useLoginAction — isPending transition (representative of the shared useActionState wiring)", () => {
  beforeEach(() => vi.clearAllMocks())

  it("isPending is true while the action is in flight, false once it resolves", async () => {
    let resolveLogin!: (value: unknown) => void
    vi.mocked(actions.loginAction).mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve
      }) as never
    )

    const { result } = renderHook(() => useLoginAction())
    expect(result.current.isPending).toBe(false)

    act(() => {
      startTransition(() => {
        result.current.action(new FormData())
      })
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))

    await act(async () => {
      resolveLogin({ success: true })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.state).toEqual({ success: true })
  })
})

describe("hook instance independence", () => {
  it("state updates in one hook instance don't leak into another (guards against sharing initialState by reference)", async () => {
    vi.mocked(actions.loginAction).mockResolvedValue({ success: true } as never)
    vi.mocked(actions.registerAction).mockResolvedValue({ error: "registerFailed" } as never)

    const { result: loginResult } = renderHook(() => useLoginAction())
    const { result: registerResult } = renderHook(() => useRegisterAction())

    await act(async () => {
      loginResult.current.action(new FormData())
    })
    await waitFor(() => expect(loginResult.current.state).toEqual({ success: true }))

    expect(registerResult.current.state).toEqual({})
  })
})
