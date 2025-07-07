import { Badge } from "@/components/ui/badge"
import type { TaskStatus } from "@/types/task"
import { STATUS_CONFIG } from "@/constants/taskStatus"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return <Badge className={cn(config.color, className)}>{config.label}</Badge>
}
