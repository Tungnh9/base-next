// Pure, framework-free calculator engine — no React, no next-intl — so every
// state transition can be unit-tested directly without rendering anything.
// CalculatorWidget owns this via useReducer and only handles rendering/i18n.

export type CalculatorOperator = "add" | "subtract" | "multiply" | "divide"
export type CalculatorDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

export interface CalculatorState {
  /** Locale-agnostic edit buffer: "." for decimals, optional leading "-".
   *  Never localized here — formatCalculatorDisplay does that at render time. */
  currentEntry: string
  firstOperand: number | null
  pendingOperator: CalculatorOperator | null
  /** True when the next digit/decimal should overwrite currentEntry instead
   *  of appending to it (right after CLEAR, OPERATOR, EQUALS, or PERCENT). */
  awaitingFreshEntry: boolean
  /** True only immediately after OPERATOR with no intervening digit — lets a
   *  second OPERATOR press swap the pending operator instead of resolving. */
  operatorJustSet: boolean
  /** Operator/operand remembered from the last EQUALS, so a bare repeated
   *  "=" press re-applies them against the current display. */
  lastOperator: CalculatorOperator | null
  lastOperand: number | null
  /** Set on division by zero. While true, only CLEAR/CLEAR_ENTRY are handled. */
  isError: boolean
}

export type CalculatorAction =
  | { type: "DIGIT"; digit: CalculatorDigit }
  | { type: "DECIMAL_POINT" }
  | { type: "OPERATOR"; operator: CalculatorOperator }
  | { type: "PERCENT" }
  | { type: "TOGGLE_SIGN" }
  | { type: "BACKSPACE" }
  | { type: "CLEAR" }
  | { type: "CLEAR_ENTRY" }
  | { type: "EQUALS" }

export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  currentEntry: "0",
  firstOperand: null,
  pendingOperator: null,
  awaitingFreshEntry: true,
  operatorJustSet: false,
  lastOperator: null,
  lastOperand: null,
  isError: false,
}

export const MAX_ENTRY_DIGITS = 16

function countDigits(entry: string): number {
  return entry.replace(/[^0-9]/g, "").length
}

function parseEntry(entry: string): number {
  return Number(entry)
}

// Kills binary float artifacts (0.1 + 0.2 === 0.30000000000000004) while
// staying within a double's ~17 reliable significant digits.
function cleanFloat(value: number): number {
  return Number(value.toPrecision(15))
}

// Number.prototype.toString() (used by numberToEntry) switches to exponential
// notation at >= 1e21, which formatCalculatorDisplay's BigInt(integerPart)
// call cannot parse ("1e+21") — crashes on render instead of just looking odd.
// Real Standard-mode calculators show "Overflow" here rather than attempting
// exact big-number display, so route it into the existing isError state.
const OVERFLOW_THRESHOLD = 1e21

function isOverflow(value: number): boolean {
  return !Number.isFinite(value) || Math.abs(value) >= OVERFLOW_THRESHOLD
}

function applyOperator(
  a: number,
  b: number,
  op: CalculatorOperator
): number | "DIVIDE_BY_ZERO" | "OVERFLOW" {
  let result: number
  if (op === "add") result = cleanFloat(a + b)
  else if (op === "subtract") result = cleanFloat(a - b)
  else if (op === "multiply") result = cleanFloat(a * b)
  else {
    if (b === 0) return "DIVIDE_BY_ZERO"
    result = cleanFloat(a / b)
  }
  return isOverflow(result) ? "OVERFLOW" : result
}

// Converts a computed number back into a plain-decimal edit-buffer string,
// avoiding JS's exponential notation for very small magnitudes (Standard
// mode calculators don't show "1.23e-7" — extreme precision is out of scope).
function numberToEntry(value: number): string {
  if (value === 0) return "0"
  const abs = Math.abs(value)
  if (abs < 1e-6) {
    return value.toFixed(20).replace(/0+$/, "").replace(/\.$/, "")
  }
  return value.toString()
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  if (state.isError && action.type !== "CLEAR" && action.type !== "CLEAR_ENTRY") {
    return state
  }

  switch (action.type) {
    case "CLEAR":
      return { ...INITIAL_CALCULATOR_STATE }

    case "CLEAR_ENTRY": {
      if (state.isError) return { ...INITIAL_CALCULATOR_STATE }
      return { ...state, currentEntry: "0", awaitingFreshEntry: true }
    }

    case "DIGIT": {
      if (state.awaitingFreshEntry) {
        return {
          ...state,
          currentEntry: action.digit === "0" ? "0" : action.digit,
          awaitingFreshEntry: false,
          operatorJustSet: false,
        }
      }
      if (countDigits(state.currentEntry) >= MAX_ENTRY_DIGITS) return state

      let currentEntry: string
      if (state.currentEntry === "0") {
        currentEntry = action.digit === "0" ? "0" : action.digit
      } else if (state.currentEntry === "-0") {
        currentEntry = action.digit === "0" ? "-0" : "-" + action.digit
      } else {
        currentEntry = state.currentEntry + action.digit
      }
      return { ...state, currentEntry, operatorJustSet: false }
    }

    case "DECIMAL_POINT": {
      if (state.awaitingFreshEntry) {
        return { ...state, currentEntry: "0.", awaitingFreshEntry: false, operatorJustSet: false }
      }
      if (state.currentEntry.includes(".")) return state
      if (countDigits(state.currentEntry) >= MAX_ENTRY_DIGITS) return state
      return { ...state, currentEntry: state.currentEntry + ".", operatorJustSet: false }
    }

    case "TOGGLE_SIGN": {
      if (state.currentEntry === "0") return state
      const currentEntry = state.currentEntry.startsWith("-")
        ? state.currentEntry.slice(1)
        : "-" + state.currentEntry
      return { ...state, currentEntry, awaitingFreshEntry: false }
    }

    case "BACKSPACE": {
      const entry = state.currentEntry
      let currentEntry: string
      if (entry.length <= 1 || (entry.length === 2 && entry.startsWith("-"))) {
        currentEntry = "0"
      } else {
        currentEntry = entry.slice(0, -1)
        if (currentEntry === "-") currentEntry = "0"
      }
      return { ...state, currentEntry, awaitingFreshEntry: false }
    }

    case "OPERATOR": {
      // Operator-swap: no digit typed since the last operator press (e.g.
      // "5 +" then "x") — just replace the pending operator, don't resolve.
      if (state.pendingOperator !== null && state.operatorJustSet) {
        return { ...state, pendingOperator: action.operator }
      }

      const enteredValue = parseEntry(state.currentEntry)

      if (state.pendingOperator === null || state.firstOperand === null) {
        return {
          ...state,
          firstOperand: enteredValue,
          pendingOperator: action.operator,
          awaitingFreshEntry: true,
          operatorJustSet: true,
        }
      }

      // Resolve the previous pending op right now, against the value just
      // entered, then start the new pending op — left-to-right, no
      // precedence, so "5 + 3 x 2 =" is 16 (resolves 5+3=8 on "x"), not 11.
      const result = applyOperator(state.firstOperand, enteredValue, state.pendingOperator)
      if (result === "DIVIDE_BY_ZERO" || result === "OVERFLOW") {
        return { ...state, isError: true, currentEntry: "0" }
      }
      return {
        ...state,
        currentEntry: numberToEntry(result),
        firstOperand: result,
        pendingOperator: action.operator,
        awaitingFreshEntry: true,
        operatorJustSet: true,
      }
    }

    case "PERCENT": {
      const entryValue = parseEntry(state.currentEntry)
      let newValue: number
      if (state.pendingOperator === null || state.firstOperand === null) {
        // No operator pending: literal percent-to-decimal conversion.
        newValue = entryValue / 100
      } else if (state.pendingOperator === "add" || state.pendingOperator === "subtract") {
        // Percent-of-first-operand, e.g. "50 + 10%" means 10% of 50 (= 5),
        // not literally 0.1 — matches the classic calculator convention.
        newValue = (state.firstOperand * entryValue) / 100
      } else {
        // For x/÷, the entry is already the scaling factor, so % is a
        // literal /100 with no reference to firstOperand — otherwise
        // "50 x 10%" would double-apply the percentage semantics.
        newValue = entryValue / 100
      }
      const cleanedValue = cleanFloat(newValue)
      if (isOverflow(cleanedValue)) {
        return { ...state, isError: true, currentEntry: "0" }
      }
      // operatorJustSet stays false (not true) so a following OPERATOR press
      // folds this percent result in via the resolve path instead of hitting
      // the swap branch and silently discarding it.
      return {
        ...state,
        currentEntry: numberToEntry(cleanedValue),
        awaitingFreshEntry: true,
        operatorJustSet: false,
      }
    }

    case "EQUALS": {
      if (state.pendingOperator !== null && state.firstOperand !== null) {
        const enteredValue = parseEntry(state.currentEntry)
        const result = applyOperator(state.firstOperand, enteredValue, state.pendingOperator)
        if (result === "DIVIDE_BY_ZERO" || result === "OVERFLOW") {
          return { ...state, isError: true, currentEntry: "0" }
        }
        return {
          ...state,
          currentEntry: numberToEntry(result),
          firstOperand: null,
          pendingOperator: null,
          lastOperator: state.pendingOperator,
          lastOperand: enteredValue,
          awaitingFreshEntry: true,
          operatorJustSet: false,
        }
      }

      if (state.lastOperator !== null && state.lastOperand !== null) {
        // Repeat-equals: nothing pending (already resolved once) — reapply
        // the last operator/operand against whatever is on screen now.
        const currentValue = parseEntry(state.currentEntry)
        const result = applyOperator(currentValue, state.lastOperand, state.lastOperator)
        if (result === "DIVIDE_BY_ZERO" || result === "OVERFLOW") {
          return { ...state, isError: true, currentEntry: "0" }
        }
        return { ...state, currentEntry: numberToEntry(result), awaitingFreshEntry: true }
      }

      // "=" with no pending op and no history — no-op, just re-displays itself.
      return { ...state, awaitingFreshEntry: true }
    }
  }
}

// Pure, locale-aware display formatter. `value` is a raw edit-buffer string
// as stored in CalculatorState.currentEntry (never the error sentinel — the
// caller branches on isError before calling this).
export function formatCalculatorDisplay(value: string, locale: string): string {
  const isNegative = value.startsWith("-")
  const unsigned = isNegative ? value.slice(1) : value
  const hasDecimalPoint = unsigned.includes(".")
  const [integerPart, ...fractionParts] = unsigned.split(".")
  const fractionDigits = fractionParts.join("")

  // Group the integer part via BigInt so long typed/computed integers never
  // lose precision the way Number-based formatting could.
  const groupedInteger = new Intl.NumberFormat(locale).format(BigInt(integerPart || "0"))

  // Read the locale's own decimal separator from Intl instead of hardcoding
  // "," or "." — mirrors this repo's existing Intl-over-hardcoding rationale.
  const decimalSeparator = hasDecimalPoint
    ? (new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === "decimal")
        ?.value ?? ".")
    : ""

  const formatted = groupedInteger + (hasDecimalPoint ? decimalSeparator + fractionDigits : "")
  return (isNegative ? "-" : "") + formatted
}

export const OPERATOR_GLYPHS: Record<CalculatorOperator, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
}

// Composes the full in-progress expression (e.g. "7.000×2") instead of just
// the second operand, so the first operand never disappears from view while
// typing. No new state needed — derived entirely from firstOperand/
// pendingOperator, using awaitingFreshEntry + operatorJustSet to tell "just
// pressed an operator, nothing typed for the second operand yet" apart from
// "a fresh value (e.g. a percent result) is already sitting in currentEntry".
export function formatExpression(state: CalculatorState, locale: string): string {
  if (state.pendingOperator === null || state.firstOperand === null) {
    return formatCalculatorDisplay(state.currentEntry, locale)
  }

  const glyph = OPERATOR_GLYPHS[state.pendingOperator]
  const firstPart = formatCalculatorDisplay(numberToEntry(state.firstOperand), locale)

  if (state.awaitingFreshEntry && state.operatorJustSet) {
    return `${firstPart}${glyph}`
  }
  return `${firstPart}${glyph}${formatCalculatorDisplay(state.currentEntry, locale)}`
}
