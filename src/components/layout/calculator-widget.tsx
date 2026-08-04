"use client"

import * as React from "react"
import { Calculator } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  calculatorReducer,
  formatExpression,
  INITIAL_CALCULATOR_STATE,
  OPERATOR_GLYPHS,
  type CalculatorAction,
  type CalculatorDigit,
} from "./calculator-logic"

interface CalculatorKeyDef {
  id: string
  // Literal glyph shown on the key by default (digits, math operators, %,
  // ., ± — universal notation, not language text, so no i18n key needed).
  label: string
  // Set only for keys whose displayed label IS language text (e.g. the "C"/
  // "CE" abbreviations) — when present, `label` is looked up via next-intl
  // instead of rendered literally, keeping every user-visible string
  // auditable even though "C"/"CE" happen to read the same in vi and en.
  labelKey?: string
  ariaKey: string
  ariaParams?: Record<string, number>
  action: CalculatorAction
  variant: "digit" | "operator" | "utility" | "equals"
}

const KEYS: CalculatorKeyDef[] = [
  {
    id: "percent",
    label: "%",
    ariaKey: "calculator.keys.percent",
    action: { type: "PERCENT" },
    variant: "utility",
  },
  {
    id: "clearEntry",
    label: "CE",
    labelKey: "calculator.keys.clearEntryLabel",
    ariaKey: "calculator.keys.clearEntry",
    action: { type: "CLEAR_ENTRY" },
    variant: "utility",
  },
  {
    id: "clear",
    label: "C",
    labelKey: "calculator.keys.clearLabel",
    ariaKey: "calculator.keys.clear",
    action: { type: "CLEAR" },
    variant: "utility",
  },
  {
    id: "backspace",
    label: "⌫",
    ariaKey: "calculator.keys.backspace",
    action: { type: "BACKSPACE" },
    variant: "utility",
  },
  {
    id: "digit7",
    label: "7",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 7 },
    action: { type: "DIGIT", digit: "7" },
    variant: "digit",
  },
  {
    id: "digit8",
    label: "8",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 8 },
    action: { type: "DIGIT", digit: "8" },
    variant: "digit",
  },
  {
    id: "digit9",
    label: "9",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 9 },
    action: { type: "DIGIT", digit: "9" },
    variant: "digit",
  },
  {
    id: "divide",
    label: OPERATOR_GLYPHS.divide,
    ariaKey: "calculator.keys.divide",
    action: { type: "OPERATOR", operator: "divide" },
    variant: "operator",
  },
  {
    id: "digit4",
    label: "4",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 4 },
    action: { type: "DIGIT", digit: "4" },
    variant: "digit",
  },
  {
    id: "digit5",
    label: "5",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 5 },
    action: { type: "DIGIT", digit: "5" },
    variant: "digit",
  },
  {
    id: "digit6",
    label: "6",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 6 },
    action: { type: "DIGIT", digit: "6" },
    variant: "digit",
  },
  {
    id: "multiply",
    label: OPERATOR_GLYPHS.multiply,
    ariaKey: "calculator.keys.multiply",
    action: { type: "OPERATOR", operator: "multiply" },
    variant: "operator",
  },
  {
    id: "digit1",
    label: "1",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 1 },
    action: { type: "DIGIT", digit: "1" },
    variant: "digit",
  },
  {
    id: "digit2",
    label: "2",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 2 },
    action: { type: "DIGIT", digit: "2" },
    variant: "digit",
  },
  {
    id: "digit3",
    label: "3",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 3 },
    action: { type: "DIGIT", digit: "3" },
    variant: "digit",
  },
  {
    id: "subtract",
    label: OPERATOR_GLYPHS.subtract,
    ariaKey: "calculator.keys.subtract",
    action: { type: "OPERATOR", operator: "subtract" },
    variant: "operator",
  },
  {
    id: "toggleSign",
    label: "±",
    ariaKey: "calculator.keys.toggleSign",
    action: { type: "TOGGLE_SIGN" },
    variant: "utility",
  },
  {
    id: "digit0",
    label: "0",
    ariaKey: "calculator.keys.digit",
    ariaParams: { digit: 0 },
    action: { type: "DIGIT", digit: "0" },
    variant: "digit",
  },
  {
    id: "decimalPoint",
    label: ".",
    ariaKey: "calculator.keys.decimalPoint",
    action: { type: "DECIMAL_POINT" },
    variant: "digit",
  },
  {
    id: "add",
    label: OPERATOR_GLYPHS.add,
    ariaKey: "calculator.keys.add",
    action: { type: "OPERATOR", operator: "add" },
    variant: "operator",
  },
  {
    id: "equals",
    label: "=",
    ariaKey: "calculator.keys.equals",
    action: { type: "EQUALS" },
    variant: "equals",
  },
]

const KEY_CLASS_BY_VARIANT: Record<CalculatorKeyDef["variant"], string> = {
  digit: "text-foreground hover:bg-foreground/[0.08] active:bg-foreground/[0.12]",
  operator: "bg-foreground/[0.05] text-foreground hover:bg-foreground/[0.08]",
  utility: "text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground",
  equals:
    "col-span-4 bg-primary text-primary-foreground hover:brightness-90 active:brightness-[0.85]",
}

export function CalculatorWidget() {
  const t = useTranslations()
  const locale = useLocale()
  const [state, dispatch] = React.useReducer(calculatorReducer, INITIAL_CALCULATOR_STATE)

  // Scoped to this popover's content only (never `document`) — only the keys
  // this calculator understands are intercepted; everything else (Escape,
  // Tab) is left alone so Radix's own focus-trap/dismiss behavior still works.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const { key } = event

    if (key >= "0" && key <= "9") {
      dispatch({ type: "DIGIT", digit: key as CalculatorDigit })
      event.preventDefault()
      return
    }
    if (key === "." || key === ",") {
      dispatch({ type: "DECIMAL_POINT" })
      event.preventDefault()
      return
    }
    if (key === "+") {
      dispatch({ type: "OPERATOR", operator: "add" })
      event.preventDefault()
      return
    }
    if (key === "-") {
      dispatch({ type: "OPERATOR", operator: "subtract" })
      event.preventDefault()
      return
    }
    if (key === "*" || key === "x" || key === "X") {
      dispatch({ type: "OPERATOR", operator: "multiply" })
      event.preventDefault()
      return
    }
    if (key === "/") {
      dispatch({ type: "OPERATOR", operator: "divide" })
      event.preventDefault()
      return
    }
    if (key === "%") {
      dispatch({ type: "PERCENT" })
      event.preventDefault()
      return
    }
    if (key === "Enter" || key === "=") {
      dispatch({ type: "EQUALS" })
      event.preventDefault()
      return
    }
    if (key === "Backspace") {
      dispatch({ type: "BACKSPACE" })
      event.preventDefault()
      return
    }
    if (key === "Delete") {
      dispatch({ type: "CLEAR_ENTRY" })
      event.preventDefault()
    }
    // Escape, Tab, and anything else: do nothing, let Radix/the browser handle it.
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("calculator.openLabel")}
          className="text-muted-foreground hover:text-foreground flex size-[26px] cursor-pointer items-center justify-center transition-colors"
        >
          <Calculator className="size-[22px]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-4">
        <div onKeyDown={handleKeyDown}>
          <div
            data-testid="calculator-display"
            aria-live="polite"
            aria-atomic="true"
            className="bg-foreground/[0.05] text-foreground mb-3 truncate rounded-[6px] px-3 py-4 text-right text-[26px] font-semibold"
          >
            {state.isError ? t("calculator.error") : formatExpression(state, locale)}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {KEYS.map((keyDef) => (
              <button
                key={keyDef.id}
                type="button"
                aria-label={t(keyDef.ariaKey, keyDef.ariaParams)}
                onClick={() => dispatch(keyDef.action)}
                className={cn(
                  "flex h-11 items-center justify-center rounded-[6px] text-[17px] font-medium transition-colors",
                  KEY_CLASS_BY_VARIANT[keyDef.variant]
                )}
              >
                {keyDef.labelKey ? t(keyDef.labelKey) : keyDef.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
