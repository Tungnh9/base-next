import { type FC } from "react"
import { ProgressStack, ProgressSegment, type ProgressVariant } from "@/components/ui/progress"
import { COLOR_VARIANT_CLASSES } from "@/components/ui/color-variants"
import { cn } from "@/lib/utils"

export interface StatusBreakdownItem {
  key: string
  label: string
  count: number
  variant: ProgressVariant
}

interface StatusBreakdownProps {
  items: StatusBreakdownItem[]
  className?: string
}

export const StatusBreakdown: FC<StatusBreakdownProps> = ({ items, className }) => {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const visibleItems = items.filter((item) => item.count > 0)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <ProgressStack size="sm" value={total > 0 ? 100 : undefined}>
        {visibleItems.map((item) => (
          <ProgressSegment
            key={item.key}
            variant={item.variant}
            value={total > 0 ? (item.count / total) * 100 : 0}
          />
        ))}
      </ProgressStack>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {items.map((item, index) => (
          <span key={item.key} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden>·</span> : null}
            <span
              aria-hidden
              className={cn("size-2 rounded-full", COLOR_VARIANT_CLASSES[item.variant])}
            />
            {item.count} {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
