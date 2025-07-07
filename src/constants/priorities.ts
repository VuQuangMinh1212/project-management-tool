export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const

export type TaskPriority = (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES]

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TASK_PRIORITIES.LOW]: "Low",
  [TASK_PRIORITIES.MEDIUM]: "Medium",
  [TASK_PRIORITIES.HIGH]: "High",
  [TASK_PRIORITIES.URGENT]: "Urgent",
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TASK_PRIORITIES.LOW]: "green",
  [TASK_PRIORITIES.MEDIUM]: "yellow",
  [TASK_PRIORITIES.HIGH]: "orange",
  [TASK_PRIORITIES.URGENT]: "red",
}

export const PRIORITY_VALUES: Record<TaskPriority, number> = {
  [TASK_PRIORITIES.LOW]: 1,
  [TASK_PRIORITIES.MEDIUM]: 2,
  [TASK_PRIORITIES.HIGH]: 3,
  [TASK_PRIORITIES.URGENT]: 4,
}

export const PRIORITY_OPTIONS = [
  { value: TASK_PRIORITIES.LOW, label: PRIORITY_LABELS.low, color: PRIORITY_COLORS.low },
  { value: TASK_PRIORITIES.MEDIUM, label: PRIORITY_LABELS.medium, color: PRIORITY_COLORS.medium },
  { value: TASK_PRIORITIES.HIGH, label: PRIORITY_LABELS.high, color: PRIORITY_COLORS.high },
  { value: TASK_PRIORITIES.URGENT, label: PRIORITY_LABELS.urgent, color: PRIORITY_COLORS.urgent },
]

export const getPriorityLabel = (priority: TaskPriority): string => {
  return PRIORITY_LABELS[priority] || "Unknown"
}

export const getPriorityColor = (priority: TaskPriority): string => {
  return PRIORITY_COLORS[priority] || "gray"
}

export const getPriorityValue = (priority: TaskPriority): number => {
  return PRIORITY_VALUES[priority] || 0
}

export const sortByPriority = (a: TaskPriority, b: TaskPriority): number => {
  return getPriorityValue(b) - getPriorityValue(a) // Higher priority first
}
