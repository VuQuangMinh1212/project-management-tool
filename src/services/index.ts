import { apiClient } from "@/lib/api/client"
import { authService } from "./api/auth"
import { tasksService } from "./api/tasks"
import { userService } from "./api/users"
import { reportsService } from "./api/reports"
import { notificationsService } from "./api/notifications"
import { projectsService } from "./api/projects"
import { approvalsService } from "./api/approvals"

export { authService, tasksService, userService, reportsService, notificationsService, projectsService, approvalsService }

export { apiClient }

export const services = {
  auth: authService,
  tasks: tasksService,
  users: userService,
  reports: reportsService,
  notifications: notificationsService,
  projects: projectsService,
  approvals: approvalsService,
} as const

export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get("/health")
    return true
  } catch {
    return false
  }
}
