export interface Report {
  id: string
  name: string
  type: ReportType
  description?: string
  filters: ReportFilters
  data: any
  createdAt: string
  updatedAt: string
  createdBy: string
}

export enum ReportType {
  TASK_SUMMARY = "task_summary",
  PRODUCTIVITY = "productivity",
  PROJECT_STATUS = "project_status",
  TIME_TRACKING = "time_tracking",
  TEAM_PERFORMANCE = "team_performance",
}

export interface ReportFilters {
  startDate?: string
  endDate?: string
  userId?: string
  projectId?: string
  status?: string
  priority?: string
  department?: string
}

export interface TaskSummaryReport {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  averageCompletionTime: number
  tasksByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  tasksByPriority: Array<{
    priority: string
    count: number
    percentage: number
  }>
}

export interface ProductivityReport {
  userId: string
  userName: string
  period: {
    startDate: string
    endDate: string
  }
  metrics: {
    tasksCompleted: number
    hoursLogged: number
    productivity: number
    efficiency: number
    averageTaskTime: number
  }
  trends: Array<{
    date: string
    tasksCompleted: number
    hoursLogged: number
  }>
}

export interface ProjectStatusReport {
  projectId: string
  projectName: string
  status: string
  progress: number
  metrics: {
    totalTasks: number
    completedTasks: number
    teamSize: number
    budget: number
    spent: number
  }
  timeline: {
    startDate: string
    endDate: string
    estimatedCompletion: string
  }
  risks: Array<{
    type: string
    description: string
    severity: "low" | "medium" | "high"
  }>
}

export interface TimeTrackingReport {
  period: {
    startDate: string
    endDate: string
  }
  totalHours: number
  billableHours: number
  breakdown: {
    byUser: Array<{
      userId: string
      userName: string
      hours: number
      tasks: number
    }>
    byProject: Array<{
      projectId: string
      projectName: string
      hours: number
      tasks: number
    }>
    byDate: Array<{
      date: string
      hours: number
      tasks: number
    }>
  }
}
