import { apiClient } from "@/lib/api/client"
import { authService } from "./api/auth"
import { tasksService } from "./api/tasks"
import { usersService } from "./api/users"
import { reportsService } from "./api/reports"
import { notificationsService } from "./api/notifications"

// Export all services
export { authService, tasksService, usersService, reportsService, notificationsService }

// Export API client for direct use
export { apiClient }

// Service registry for dependency injection or testing
export const services = {
  auth: authService,
  tasks: tasksService,
  users: usersService,
  reports: reportsService,
  notifications: notificationsService,
} as const

// Health check function
export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get("/health")
    return true
  } catch {
    return false
  }
}
