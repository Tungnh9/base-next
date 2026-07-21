import { type FC, type ReactNode } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: ReactNode
  description?: ReactNode
  className?: string
}

export const StatCard: FC<StatCardProps> = ({ title, value, description, className }) => {
  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader className="border-b-0 pb-0">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="gap-1 pt-2">
        <p className="text-2xl font-semibold">{value}</p>
        {description ? <div className="text-muted-foreground text-sm">{description}</div> : null}
      </CardContent>
    </Card>
  )
}
