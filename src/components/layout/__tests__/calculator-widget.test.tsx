import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"

import { CalculatorWidget } from "../calculator-widget"

function key(name: string) {
  return screen.getByText(name, { selector: "button" })
}

async function openCalculator() {
  const user = userEvent.setup()
  render(<CalculatorWidget />)
  await user.click(screen.getByRole("button", { name: "calculator.openLabel" }))
  return user
}

describe("CalculatorWidget", () => {
  it("opens the calculator popover from the header trigger, showing an initial display of 0", async () => {
    await openCalculator()
    expect(await screen.findByTestId("calculator-display")).toHaveTextContent("0")
  })

  it("computes a basic operation via click: 5 + 3 = 8", async () => {
    const user = await openCalculator()

    await user.click(key("5"))
    await user.click(key("+"))
    await user.click(key("3"))
    await user.click(key("="))

    expect(screen.getByTestId("calculator-display")).toHaveTextContent("8")
  })

  it("shows the localized error message on division by zero, and C recovers", async () => {
    const user = await openCalculator()

    await user.click(key("5"))
    await user.click(key("÷"))
    await user.click(key("0"))
    await user.click(key("="))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("calculator.error")

    await user.click(key("calculator.keys.clearLabel"))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("0")
  })

  it("drives the same reducer from the physical keyboard without breaking Escape-to-close", async () => {
    const user = await openCalculator()

    await user.keyboard("5+3")
    await user.keyboard("{Enter}")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("8")

    await user.keyboard("{Escape}")
    expect(screen.queryByTestId("calculator-display")).not.toBeInTheDocument()
  })

  it("keeps the in-progress calculation across a popover close/reopen", async () => {
    const user = await openCalculator()

    await user.click(key("5"))
    await user.click(key("+"))
    await user.keyboard("{Escape}")
    expect(screen.queryByTestId("calculator-display")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "calculator.openLabel" }))
    await user.click(key("3"))
    await user.click(key("="))

    expect(screen.getByTestId("calculator-display")).toHaveTextContent("8")
  })

  it("supports the decimal point, sign toggle, backspace, and clear-entry keys via click", async () => {
    const user = await openCalculator()

    await user.click(key("1"))
    await user.click(key("."))
    await user.click(key("5"))
    // useLocale() is globally mocked to "vi" in tests, so the display uses
    // Vietnamese-style formatting (comma as the decimal separator).
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("1,5")

    await user.click(key("±"))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("-1,5")

    await user.click(key("⌫"))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("-1,")

    await user.click(key("calculator.keys.clearEntryLabel"))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("0")
  })

  it("keeps the first operand visible as the full expression while typing the second operand", async () => {
    const user = await openCalculator()

    await user.click(key("7"))
    await user.click(key("0"))
    await user.click(key("0"))
    await user.click(key("0"))
    // useLocale() is mocked to "vi" — dot thousands grouping.
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("7.000")

    await user.click(key("×"))
    // No second-operand digit typed yet — must not duplicate the first operand.
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("7.000×")

    await user.click(key("2"))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("7.000×2")

    await user.click(key("="))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("14.000")
  })

  it("computes multiplication, subtraction, and percent via click", async () => {
    const user = await openCalculator()

    await user.click(key("5"))
    await user.click(key("0"))
    await user.click(key("×"))
    await user.click(key("1"))
    await user.click(key("0"))
    await user.click(key("%"))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("0,1")

    await user.click(key("="))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("5")

    await user.click(key("2"))
    await user.click(key("−"))
    await user.click(key("1"))
    await user.click(key("="))
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("1")
  })

  it("maps every physical-keyboard operator, backspace, and delete key to the right action", async () => {
    const user = await openCalculator()

    await user.keyboard("9-4{Enter}")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("5")

    await user.keyboard("{Delete}")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("0")

    await user.keyboard("3*2{Enter}")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("6")

    await user.keyboard("{Delete}")
    await user.keyboard("8/2{Enter}")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("4")

    await user.keyboard("{Delete}")
    await user.keyboard("12")
    await user.keyboard("{Backspace}")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("1")

    await user.keyboard("{Delete}")
    await user.keyboard(".5")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("0,5")

    await user.keyboard("{Delete}")
    await user.keyboard("50%")
    expect(screen.getByTestId("calculator-display")).toHaveTextContent("0,5")
  })
})
