import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { FIELD_SIZE, FIELD_VALIDATION_CLASSES } from "@/lib/field-variants"

const inputVariants = cva(
  cn(
    "w-full min-w-0 border border-input bg-card outline-none transition-[color,box-shadow,background-color] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground has-[input:read-only]:bg-foreground/[0.08] disabled:cursor-not-allowed disabled:opacity-50",
    FIELD_VALIDATION_CLASSES
  ),
  {
    variants: {
      size: {
        // Figma Small: h=30px
        sm: cn(FIELD_SIZE.sm.radius, FIELD_SIZE.sm.px, FIELD_SIZE.sm.text, "h-[30px]"),
        // Figma Default: h=38px
        default: cn(FIELD_SIZE.default.radius, FIELD_SIZE.default.px, FIELD_SIZE.default.text, "h-[38px]"),
        // Figma Large: h=48px
        lg: cn(FIELD_SIZE.lg.radius, FIELD_SIZE.lg.px, FIELD_SIZE.lg.text, "h-12"),
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const inputIconGap = {
  sm: "gap-1.5",
  default: "gap-2",
  lg: "gap-2",
} as const

const inputIconSize = {
  sm: "[&_svg]:size-[18px]",
  default: "[&_svg]:size-5",
  lg: "[&_svg]:size-[22px]",
} as const

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    isValid?: boolean
    /** Native HTML `size` attribute (visible character width) — `size` above drives the design-system variant instead. */
    htmlSize?: number
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    type,
    size = "default",
    startIcon,
    endIcon,
    isValid,
    htmlSize,
    id,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref
) {
  const dataValid = isValid === undefined ? undefined : String(isValid)
  const hasIcon = Boolean(startIcon || endIcon)

  return (
    <div
      data-slot="input-wrapper"
      data-valid={dataValid}
      className={cn(
        inputVariants({ size }),
        "flex items-center has-disabled:cursor-not-allowed has-disabled:opacity-50",
        hasIcon && [inputIconGap[size ?? "default"], inputIconSize[size ?? "default"]],
        className
      )}
    >
      {startIcon && (
        <span aria-hidden="true" className="shrink-0 flex items-center justify-center text-muted-foreground">
          {startIcon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        size={htmlSize}
        data-slot="input"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground"
        {...props}
      />
      {endIcon && (
        <span aria-hidden="true" className="shrink-0 flex items-center justify-center text-muted-foreground">
          {endIcon}
        </span>
      )}
    </div>
  )
})

// ─── Floating Label Input ─────────────────────────────────────────────────────

type FloatingLabelInputProps = Omit<InputProps, "placeholder"> & {
  /** Animated floating label — replaces placeholder, floats above border on focus/fill */
  label: string
  /** Helper text shown below the input; colored red on error, green on valid */
  helperText?: string
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  function FloatingLabelInput(
    {
      label,
      helperText,
      id,
      size = "default",
      isValid,
      "aria-invalid": ariaInvalid,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      onChange: onChangeProp,
      value,
      defaultValue,
      className,
      ...rest
    },
    ref
  ) {
    const genId = React.useId()
    const resolvedId = id ?? genId
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(
      value !== undefined ? String(value).length > 0 : !!defaultValue
    )

    // Sync floating state with controlled value changes
    React.useEffect(() => {
      if (value !== undefined) setHasValue(String(value).length > 0)
    }, [value])

    const isFloating = focused || hasValue

    return (
      <div className={cn("flex flex-col", className)}>
        <div className="relative">
          <Input
            ref={ref}
            id={resolvedId}
            size={size}
            isValid={isValid}
            aria-invalid={ariaInvalid}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => {
              setFocused(true)
              onFocusProp?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlurProp?.(e)
            }}
            onChange={(e) => {
              if (value === undefined) setHasValue(e.target.value.length > 0)
              onChangeProp?.(e)
            }}
            {...rest}
          />
          {/* Label floats above the top border when focused or filled */}
          <label
            htmlFor={resolvedId}
            style={{
              top: isFloating ? 0 : "50%",
              transform: isFloating
                ? "translateX(4px) translateY(-50%)"
                : "translateY(-50%)",
              fontSize: isFloating ? "11px" : "15px",
            }}
            className={cn(
              "pointer-events-none absolute left-3 bg-card px-1 leading-none transition-all duration-150",
              isFloating && focused ? "text-primary" : "text-muted-foreground"
            )}
          >
            {label}
          </label>
        </div>
        {helperText && (
          <p
            className={cn(
              "mt-1.5 text-[13px] leading-[18px]",
              ariaInvalid
                ? "text-destructive"
                : isValid
                ? "text-success"
                : "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

export { Input, inputVariants, FloatingLabelInput }
export type { InputProps, FloatingLabelInputProps }
