import * as React from "react"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import type { ButtonSkin } from "@/components/ui/button"

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>

const FILLED_VARIANTS: ButtonVariant[] = [
  "default", "secondary", "destructive", "success", "warning", "info", "dark",
]

function ButtonGroup({
  children,
  className,
  variant,
  skin,
  size,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: ButtonVariant
  skin?: ButtonSkin
  size?: ButtonSize
  orientation?: "horizontal" | "vertical"
}) {
  const isVertical = orientation === "vertical"
  const validChildren = React.Children.toArray(children).filter(
    React.isValidElement
  ) as React.ReactElement<{
    className?: string
    style?: React.CSSProperties
    variant?: ButtonVariant
    skin?: ButtonSkin
    size?: ButtonSize
  }>[]

  const count = validChildren.length

  // Infer effective variant/skin from first child when not set on group
  const effectiveVariant = variant ?? validChildren[0]?.props.variant
  const effectiveSkin = skin ?? validChildren[0]?.props.skin

  // A button group is "filled" when its variant is a solid-color one AND skin is not outline/light
  const isFilled =
    effectiveVariant !== undefined &&
    FILLED_VARIANTS.includes(effectiveVariant) &&
    (effectiveSkin === undefined || effectiveSkin === "filled")

  // Outline: either the neutral outline variant, or a color variant with skin="outline"
  const isOutline =
    effectiveVariant === "outline" ||
    (effectiveVariant !== undefined && effectiveSkin === "outline")

  const styledChildren = validChildren.map((child, i) => {
    const isFirst = i === 0
    const isLast = i === count - 1
    const isSingle = count === 1

    // Inline styles for border-radius — guaranteed to override Tailwind class-based radius
    const radiusStyle: React.CSSProperties = {}
    if (!isSingle) {
      if (isVertical) {
        if (isFirst) {
          radiusStyle.borderBottomLeftRadius = 0
          radiusStyle.borderBottomRightRadius = 0
        } else if (isLast) {
          radiusStyle.borderTopLeftRadius = 0
          radiusStyle.borderTopRightRadius = 0
        } else {
          radiusStyle.borderRadius = 0
        }
      } else {
        if (isFirst) {
          radiusStyle.borderTopRightRadius = 0
          radiusStyle.borderBottomRightRadius = 0
        } else if (isLast) {
          radiusStyle.borderTopLeftRadius = 0
          radiusStyle.borderBottomLeftRadius = 0
        } else {
          radiusStyle.borderRadius = 0
        }
      }
    }

    const extraClasses = cn(
      // Remove individual shadow — group wrapper carries it instead
      isFilled && "shadow-none disabled:shadow-none",
      // Outline: collapse shared border between adjacent buttons
      isOutline && !isSingle && !isFirst && (isVertical ? "mt-[-1px]" : "ml-[-1px]"),
      // Outline: stacking context so hovered button border is always visible
      isOutline && !isSingle && "relative hover:z-10 focus-visible:z-10",
      // Filled: thin white separator between adjacent buttons
      isFilled && !isSingle && !isLast && (
        isVertical ? "border-b border-white/20" : "border-r border-white/20"
      ),
    )

    const isDOMElement = typeof child.type === "string"
    return React.cloneElement(child, {
      className: cn(child.props.className, extraClasses),
      style: { ...child.props.style, ...radiusStyle },
      ...(isDOMElement ? {} : {
        variant: variant ?? child.props.variant,
        skin: skin ?? child.props.skin,
        size: size ?? child.props.size,
      }),
    })
  })

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(
        "inline-flex",
        isVertical ? "flex-col" : "flex-row",
        className,
      )}
      {...props}
    >
      {styledChildren}
    </div>
  )
}

export { ButtonGroup }
