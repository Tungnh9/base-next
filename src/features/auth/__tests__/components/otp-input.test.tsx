import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { OtpInput } from "../../components/otp-input"

function renderOtp(value: string[] = ["", "", "", "", "", ""]) {
  const onChange = vi.fn()
  render(<OtpInput value={value} onChange={onChange} />)
  const inputs = screen.getAllByRole("textbox") as HTMLInputElement[]
  return { onChange, inputs }
}

describe("OtpInput", () => {
  it("renders `length` inputs (default 6)", () => {
    renderOtp()

    expect(screen.getAllByRole("textbox")).toHaveLength(6)
  })

  it("keeps only the last typed digit and calls onChange with it in place", () => {
    const { onChange, inputs } = renderOtp()

    fireEvent.change(inputs[0], { target: { value: "5" } })

    expect(onChange).toHaveBeenCalledWith(["5", "", "", "", "", ""])
  })

  it("strips non-digit characters from the typed value", () => {
    const { onChange, inputs } = renderOtp()

    fireEvent.change(inputs[0], { target: { value: "a1b" } })

    expect(onChange).toHaveBeenCalledWith(["1", "", "", "", "", ""])
  })

  it("auto-focuses the next input after typing a digit", () => {
    const { inputs } = renderOtp()

    fireEvent.change(inputs[0], { target: { value: "5" } })

    expect(inputs[1]).toHaveFocus()
  })

  it("does not move focus past the last input", () => {
    const { inputs } = renderOtp(["1", "2", "3", "4", "5", ""])
    inputs[5].focus()

    fireEvent.change(inputs[5], { target: { value: "6" } })

    expect(inputs[5]).toHaveFocus()
  })

  it("moves focus to the previous input on Backspace when the current one is empty", () => {
    const { inputs } = renderOtp(["1", "", "", "", "", ""])
    inputs[1].focus()

    fireEvent.keyDown(inputs[1], { key: "Backspace" })

    expect(inputs[0]).toHaveFocus()
  })

  it("does not move focus on Backspace when the current input still has a value", () => {
    const { inputs } = renderOtp(["1", "2", "", "", "", ""])
    inputs[1].focus()

    fireEvent.keyDown(inputs[1], { key: "Backspace" })

    expect(inputs[1]).toHaveFocus()
  })

  it("splits a pasted code across all inputs and focuses the last filled one", () => {
    const { onChange, inputs } = renderOtp()

    fireEvent.paste(inputs[0], { clipboardData: { getData: () => "123456" } })

    expect(onChange).toHaveBeenCalledWith(["1", "2", "3", "4", "5", "6"])
    expect(inputs[5]).toHaveFocus()
  })

  it("strips non-digits and truncates a paste longer than `length`", () => {
    const { onChange, inputs } = renderOtp()

    fireEvent.paste(inputs[0], { clipboardData: { getData: () => "12-34-56-789" } })

    expect(onChange).toHaveBeenCalledWith(["1", "2", "3", "4", "5", "6"])
  })
})
