import { apiClient } from "@/lib/api/client"

export interface ReportFilters {
  startDate?: string
  endDate?: string
  userId?: string
  projectId?: string
  type?: string
}

export interface TaskReport {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  averageCompletionTime: number
}

export interface ProductivityReport {
  userId: string
  userName: string
  tasksCompleted: number
  hoursLogged: number
  productivity: number
  efficiency: number
}

export interface ProjectReport {
  projectId: string
  projectName: string
  progress: number
  tasksTotal: number
  tasksCompleted: number
  teamSize: number
  estimatedCompletion: string
}

export const reportsService = {
  async getTaskReport(filters?: ReportFilters): Promise<TaskReport> {
    return apiClient.get("/reports/tasks", { params: filters })
  },

  async getProductivityReport(filters?: ReportFilters): Promise<ProductivityReport[]> {
    return apiClient.get("/reports/productivity", { params: filters })
  },

  async getProjectReport(filters?: ReportFilters): Promise<ProjectReport[]> {
    return apiClient.get("/reports/projects", { params: filters })
  },

  async getTimeReport(filters?: ReportFilters): Promise<{
    totalHours: number
    billableHours: number
    breakdown: Array<{
      date: string
      hours: number
      tasks: number
    }>
  }> {
    return apiClient.get("/reports/time", { params: filters })
  },

  async exportReport(type: string, filters?: ReportFilters): Promise<Blob> {
    const response = await apiClient.get(`/reports/export/${type}`, {
      params: filters,
      responseType: "blob",
    })
    return response as unknown as Blob
  },
}
