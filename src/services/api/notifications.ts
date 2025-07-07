import { apiClient } from "@/lib/api/client"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface NotificationFilters {
  read?: boolean
  type?: string
  page?: number
  limit?: number
}

export const notificationsService = {
  async getNotifications(filters?: NotificationFilters): Promise<{
    notifications: Notification[]
    total: number
    unreadCount: number
  }> {
    return apiClient.get("/notifications", { params: filters })
  },

  async markAsRead(id: string): Promise<void> {
    return apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.patch("/notifications/read-all")
  },

  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete(`/notifications/${id}`)
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get("/notifications/unread-count")
  },

  async updatePreferences(preferences: {
    email: boolean
    push: boolean
    inApp: boolean
    types: string[]
  }): Promise<void> {
    return apiClient.patch("/notifications/preferences", preferences)
  },
}
