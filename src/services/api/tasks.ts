import { apiClient } from "@/lib/api/client"
import type { Task, CreateTaskData, UpdateTaskData, TaskComment } from "@/types/task"

export const tasksService = {
  async getTasks(params?: {
    status?: string
    assigneeId?: string
    projectId?: string
    page?: number
    limit?: number
  }): Promise<{ tasks: Task[]; total: number; page: number; totalPages: number }> {
    return apiClient.get("/tasks", { params })
  },

  async getTask(id: string): Promise<Task> {
    return apiClient.get(`/tasks/${id}`)
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    return apiClient.post("/tasks", data)
  },

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    return apiClient.patch(`/tasks/${id}`, data)
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete(`/tasks/${id}`)
  },

  async addComment(taskId: string, content: string): Promise<TaskComment> {
    return apiClient.post(`/tasks/${taskId}/comments`, { content })
  },

  async updateComment(taskId: string, commentId: string, content: string): Promise<TaskComment> {
    return apiClient.patch(`/tasks/${taskId}/comments/${commentId}`, { content })
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
  },

  async uploadAttachment(taskId: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}
