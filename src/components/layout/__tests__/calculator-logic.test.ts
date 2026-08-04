import { describe, it, expect } from "vitest"
import {
  calculatorReducer,
  formatCalculatorDisplay,
  formatExpression,
  INITIAL_CALCULATOR_STATE,
  MAX_ENTRY_DIGITS,
  type CalculatorAction,
  type CalculatorDigit,
  type CalculatorState,
} from "../calculator-logic"

function digit(d: CalculatorDigit): CalculatorAction {
  return { type: "DIGIT", digit: d }
}

function typeNumber(value: string): CalculatorAction[] {
  return value.split("").map((ch) => digit(ch as CalculatorDigit))
}

const decimalPoint: CalculatorAction = { type: "DECIMAL_POINT" }
const percent: CalculatorAction = { type: "PERCENT" }
const toggleSign: CalculatorAction = { type: "TOGGLE_SIGN" }
const backspace: CalculatorAction = { type: "BACKSPACE" }
const clear: CalculatorAction = { type: "CLEAR" }
const clearEntry: CalculatorAction = { type: "CLEAR_ENTRY" }
const equals: CalculatorAction = { type: "EQUALS" }
function operator(op: "add" | "subtract" | "multiply" | "divide"): CalculatorAction {
  return { type: "OPERATOR", operator: op }
}

function run(
  actions: CalculatorAction[],
  initial: CalculatorState = INITIAL_CALCULATOR_STATE
): CalculatorState {
  return actions.reduce(calculatorReducer, initial)
}

describe("calculatorReducer › digit entry", () => {
  it("collapses a leading zero when a non-zero digit follows", () => {
    expect(run([digit("0"), digit("5")]).currentEntry).toBe("5")
  })

  it("keeps a single zero when zero is pressed twice", () => {
    expect(run([digit("0"), digit("0")]).currentEntry).toBe("0")
  })

  it("appends digits normally once entry has started", () => {
    expect(run([digit("1"), digit("2"), digit("3")]).currentEntry).toBe("123")
  })

  it("ignores further digits once MAX_ENTRY_DIGITS is reached", () => {
    const digits = Array.from({ length: MAX_ENTRY_DIGITS }, (_, i) =>
      digit(String((i % 9) + 1) as CalculatorDigit)
    )
    const atCap = run(digits)
    expect(atCap.currentEntry).toHaveLength(MAX_ENTRY_DIGITS)

    const overCap = calculatorReducer(atCap, digit("9"))
    expect(overCap.currentEntry).toBe(atCap.currentEntry)
  })

  it("overwrites the display after an operator but preserves the pending operation", () => {
    const state = run([digit("5"), operator("add"), digit("3")])
    expect(state.currentEntry).toBe("3")
    expect(state.firstOperand).toBe(5)
    expect(state.pendingOperator).toBe("add")
  })

  it("keeps the sign when appending a digit to a backspaced-down '-0'", () => {
    // "-0.5" backspaced twice lands on the "-0" edge case (strips "5" then
    // "."), distinct from the plain "0" case: a following digit must reuse
    // the "-" prefix instead of dropping it.
    const negativeZero = run([
      digit("0"),
      decimalPoint,
      digit("5"),
      toggleSign,
      backspace,
      backspace,
    ])
    expect(negativeZero.currentEntry).toBe("-0")

    expect(calculatorReducer(negativeZero, digit("7")).currentEntry).toBe("-7")
    expect(calculatorReducer(negativeZero, digit("0")).currentEntry).toBe("-0")
  })
})

describe("calculatorReducer › decimal point", () => {
  it("starts a fresh entry with '0.' right after an operator", () => {
    const state = run([digit("5"), operator("add"), decimalPoint])
    expect(state.currentEntry).toBe("0.")
  })

  it("ignores a second decimal point", () => {
    expect(run([digit("1"), decimalPoint, digit("5"), decimalPoint, digit("2")]).currentEntry).toBe(
      "1.52"
    )
  })

  it("is blocked by the max-digit guard like any other key", () => {
    const digits = Array.from({ length: MAX_ENTRY_DIGITS }, (_, i) =>
      digit(String((i % 9) + 1) as CalculatorDigit)
    )
    const atCap = run(digits)
    expect(calculatorReducer(atCap, decimalPoint).currentEntry).toBe(atCap.currentEntry)
  })
})

describe("calculatorReducer › chained operators (no precedence)", () => {
  it("resolves left-to-right: 5 + 3 x 2 = gives 16, not 11", () => {
    const state = run([
      digit("5"),
      operator("add"),
      digit("3"),
      operator("multiply"),
      digit("2"),
      equals,
    ])
    expect(state.currentEntry).toBe("16")
  })

  it("swaps the pending operator instead of recomputing when no digit was typed in between", () => {
    const state = run([digit("5"), operator("add"), operator("multiply")])
    expect(state.firstOperand).toBe(5)
    expect(state.pendingOperator).toBe("multiply")
  })
})

describe("calculatorReducer › percent", () => {
  it("converts to a plain decimal when no operator is pending", () => {
    expect(run([digit("5"), digit("0"), percent]).currentEntry).toBe("0.5")
  })

  it("computes percent-of-first-operand after + (50 + 10% = 55)", () => {
    const afterPercent = run([
      digit("5"),
      digit("0"),
      operator("add"),
      digit("1"),
      digit("0"),
      percent,
    ])
    expect(afterPercent.currentEntry).toBe("5")
    expect(calculatorReducer(afterPercent, equals).currentEntry).toBe("55")
  })

  it("computes percent-of-first-operand after - (100 - 50% = 50)", () => {
    const state = run([
      digit("1"),
      digit("0"),
      digit("0"),
      operator("subtract"),
      digit("5"),
      digit("0"),
      percent,
      equals,
    ])
    expect(state.currentEntry).toBe("50")
  })

  it("treats percent as a literal /100 scale factor after x or / (50 x 10% = 5)", () => {
    const afterPercent = run([
      digit("5"),
      digit("0"),
      operator("multiply"),
      digit("1"),
      digit("0"),
      percent,
    ])
    expect(afterPercent.currentEntry).toBe("0.1")
    expect(calculatorReducer(afterPercent, equals).currentEntry).toBe("5")
  })

  it("folds the percent result in before a following operator (does not get swapped away)", () => {
    // Regression guard: percent must NOT set operatorJustSet, otherwise this
    // second operator would hit the swap branch and silently discard the
    // percent-derived "5" (10% of 50), leaving firstOperand stuck at 50.
    const state = run([
      digit("5"),
      digit("0"),
      operator("add"),
      digit("1"),
      digit("0"),
      percent,
      operator("subtract"),
    ])
    expect(state.firstOperand).toBe(55)
    expect(state.pendingOperator).toBe("subtract")
  })
})

describe("calculatorReducer › equals and repeat-equals", () => {
  it("computes a simple binary operation", () => {
    expect(run([digit("5"), operator("add"), digit("3"), equals]).currentEntry).toBe("8")
  })

  it("re-applies the last operator/operand on each subsequent bare equals press", () => {
    const first = run([digit("5"), operator("add"), digit("3"), equals])
    expect(first.currentEntry).toBe("8")
    const second = calculatorReducer(first, equals)
    expect(second.currentEntry).toBe("11")
    const third = calculatorReducer(second, equals)
    expect(third.currentEntry).toBe("14")
  })

  it("is a no-op when there is no pending operator and no history", () => {
    const state = run([digit("5"), equals])
    expect(state.currentEntry).toBe("5")
  })
})

describe("calculatorReducer › division by zero", () => {
  it("flags isError for a non-zero dividend divided by zero", () => {
    const state = run([digit("5"), operator("divide"), digit("0"), equals])
    expect(state.isError).toBe(true)
  })

  it("flags isError for 0 / 0", () => {
    const state = run([digit("0"), operator("divide"), digit("0"), equals])
    expect(state.isError).toBe(true)
  })

  it("also flags isError when the divide-by-zero resolves via a chained operator instead of equals", () => {
    const state = run([digit("5"), operator("divide"), digit("0"), operator("add")])
    expect(state.isError).toBe(true)
  })

  it("ignores digit and operator input while in the error state", () => {
    const errored = run([digit("5"), operator("divide"), digit("0"), equals])
    expect(calculatorReducer(errored, digit("7"))).toEqual(errored)
    expect(calculatorReducer(errored, operator("add"))).toEqual(errored)
  })

  it("recovers fully on CLEAR", () => {
    const errored = run([digit("5"), operator("divide"), digit("0"), equals])
    expect(calculatorReducer(errored, clear)).toEqual(INITIAL_CALCULATOR_STATE)
  })

  it("recovers fully on CLEAR_ENTRY too (no meaningful pending state to preserve)", () => {
    const errored = run([digit("5"), operator("divide"), digit("0"), equals])
    expect(calculatorReducer(errored, clearEntry)).toEqual(INITIAL_CALCULATOR_STATE)
  })
})

describe("calculatorReducer › overflow", () => {
  it("flags isError when a result reaches exactly the 1e21 exponential-notation threshold", () => {
    // 1_000_000_000_000_000 (1e15, 16 digits, at MAX_ENTRY_DIGITS) x 1_000_000 = 1e21 exactly.
    // Number.prototype.toString() switches to exponential notation at >= 1e21, which would
    // otherwise crash formatCalculatorDisplay's BigInt(integerPart) call on "1e+21".
    const state = run([
      ...typeNumber("1000000000000000"),
      operator("multiply"),
      ...typeNumber("1000000"),
      equals,
    ])
    expect(state.isError).toBe(true)
  })

  it("flags isError for a result well past the threshold, instead of a garbled exponential display", () => {
    const state = run([
      ...typeNumber("100000000000"),
      operator("multiply"),
      ...typeNumber("100000000000"),
      equals,
    ])
    expect(state.isError).toBe(true)
  })

  it("also flags isError when the overflow resolves via a chained operator instead of equals", () => {
    const state = run([
      ...typeNumber("100000000000"),
      operator("multiply"),
      ...typeNumber("100000000000"),
      operator("add"),
    ])
    expect(state.isError).toBe(true)
  })

  it("does not flag isError for a large but sub-1e21 result", () => {
    const state = run([...typeNumber("999999999999999"), operator("add"), digit("1"), equals])
    expect(state.isError).toBe(false)
    expect(state.currentEntry).toBe("1000000000000000")
  })

  it("also flags isError when a percent-of-first-operand computation overflows", () => {
    const state = run([
      ...typeNumber("999999999999999"),
      operator("add"),
      ...typeNumber("999999999999999"),
      percent,
    ])
    expect(state.isError).toBe(true)
  })
})

describe("calculatorReducer › clear / clear entry", () => {
  it("CLEAR resets to the exact initial state", () => {
    const state = run([digit("5"), operator("add"), digit("3")])
    expect(calculatorReducer(state, clear)).toEqual(INITIAL_CALCULATOR_STATE)
  })

  it("CLEAR_ENTRY resets only the current entry, preserving the pending operation", () => {
    const state = run([digit("5"), operator("add"), digit("9"), digit("9")])
    const afterCe = calculatorReducer(state, clearEntry)
    expect(afterCe.currentEntry).toBe("0")
    expect(afterCe.firstOperand).toBe(5)
    expect(afterCe.pendingOperator).toBe("add")
  })
})

describe("calculatorReducer › backspace", () => {
  it("removes the last digit", () => {
    expect(run([digit("5"), digit("3"), backspace]).currentEntry).toBe("5")
  })

  it("collapses a single remaining digit to 0", () => {
    expect(run([digit("5"), backspace]).currentEntry).toBe("0")
  })

  it("collapses a single negative digit to 0, not a dangling '-'", () => {
    expect(run([digit("5"), toggleSign, backspace]).currentEntry).toBe("0")
  })

  it("is a no-op on '0'", () => {
    expect(run([backspace]).currentEntry).toBe("0")
  })
})

describe("calculatorReducer › sign toggle", () => {
  it("toggles a positive entry to negative and back", () => {
    const negative = run([digit("5"), toggleSign])
    expect(negative.currentEntry).toBe("-5")
    expect(calculatorReducer(negative, toggleSign).currentEntry).toBe("5")
  })

  it("never turns '0' into '-0'", () => {
    expect(run([toggleSign]).currentEntry).toBe("0")
  })
})

describe("calculatorReducer › floating-point cleanup", () => {
  it("displays 0.1 + 0.2 as exactly 0.3", () => {
    const state = run([decimalPoint, digit("1"), operator("add"), decimalPoint, digit("2"), equals])
    expect(state.currentEntry).toBe("0.3")
  })
})

describe("formatCalculatorDisplay", () => {
  it("formats a grouped integer for vi (dot thousands)", () => {
    expect(formatCalculatorDisplay("1234567", "vi")).toBe("1.234.567")
  })

  it("formats a grouped integer for en (comma thousands)", () => {
    expect(formatCalculatorDisplay("1234567", "en")).toBe("1,234,567")
  })

  it("preserves a trailing decimal point while mid-typing (vi)", () => {
    expect(formatCalculatorDisplay("1234.", "vi")).toBe("1.234,")
  })

  it("preserves trailing zeros after the decimal point instead of collapsing them", () => {
    expect(formatCalculatorDisplay("5.20", "vi")).toBe("5,20")
  })

  it("formats a negative number with locale-correct separators", () => {
    expect(formatCalculatorDisplay("-1234.5", "vi")).toBe("-1.234,5")
  })

  it("groups a 16-digit integer without precision loss", () => {
    expect(formatCalculatorDisplay("1234567890123456", "vi")).toBe("1.234.567.890.123.456")
  })

  it("formats plain zero and a bare trailing dot the same in both locales", () => {
    expect(formatCalculatorDisplay("0", "vi")).toBe("0")
    expect(formatCalculatorDisplay("0", "en")).toBe("0")
    expect(formatCalculatorDisplay("0.", "vi")).toBe("0,")
    expect(formatCalculatorDisplay("0.", "en")).toBe("0.")
  })
})

describe("formatExpression", () => {
  it("shows only the current entry when no operator is pending", () => {
    const state = run([digit("1"), digit("2"), digit("3")])
    expect(formatExpression(state, "vi")).toBe("123")
  })

  it("shows the first operand and operator glyph right after pressing an operator, with no second operand typed yet", () => {
    const state = run([digit("5"), operator("add")])
    expect(formatExpression(state, "vi")).toBe("5+")
  })

  it("shows the full expression once the second operand is being typed, matching the user's own example", () => {
    const state = run([
      digit("7"),
      digit("0"),
      digit("0"),
      digit("0"),
      operator("multiply"),
      digit("2"),
    ])
    expect(formatExpression(state, "vi")).toBe("7.000×2")
  })

  it("keeps showing only the updated operator after a swap, without duplicating the first operand", () => {
    const state = run([digit("5"), operator("add"), operator("multiply")])
    expect(formatExpression(state, "vi")).toBe("5×")
  })

  it("shows the resolved intermediate value and the new operator after a chained operator resolves", () => {
    const state = run([digit("5"), operator("add"), digit("3"), operator("multiply")])
    expect(formatExpression(state, "vi")).toBe("8×")
  })

  it("shows the percent-derived second operand immediately, even though awaitingFreshEntry is set", () => {
    const state = run([digit("5"), digit("0"), operator("add"), digit("1"), digit("0"), percent])
    expect(formatExpression(state, "vi")).toBe("50+5")
  })

  it("shows the literal percent scale factor after x/÷ as the second operand", () => {
    const state = run([
      digit("5"),
      digit("0"),
      operator("multiply"),
      digit("1"),
      digit("0"),
      percent,
    ])
    expect(formatExpression(state, "vi")).toBe("50×0,1")
  })

  it("collapses back to just the result after equals", () => {
    const state = run([digit("5"), operator("add"), digit("3"), equals])
    expect(formatExpression(state, "vi")).toBe("8")
  })

  it("formats the first operand using the given locale (en comma grouping)", () => {
    const state = run([
      digit("7"),
      digit("0"),
      digit("0"),
      digit("0"),
      operator("divide"),
      digit("2"),
    ])
    expect(formatExpression(state, "en")).toBe("7,000÷2")
  })
})
