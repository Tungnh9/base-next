import type { FC } from "react"
import { Badge } from "@/components/ui/badge"

interface FeaturePlaceholderProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  badgeLabel: string
}

// Shared shell for protected routes whose sidebar entry is still disabled
// ("coming soon"). Deliberately minimal — these are placeholder shells, not
// real feature pages; do not add per-feature logic here.
export const FeaturePlaceholder: FC<FeaturePlaceholderProps> = ({
  icon: Icon,
  title,
  badgeLabel,
}) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="bg-muted flex size-16 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-8" />
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <Badge variant="secondary" skin="light">
        {badgeLabel}
      </Badge>
    </div>
  )
}
