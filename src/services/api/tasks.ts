import { apiClient } from "@/lib/api/client"
import type { Task, CreateTaskData, UpdateTaskData, TaskComment } from "@/types/task"

export const tasksService = {
  async getTasks(params?: {
    status?: string
    assigneeId?: string
    projectId?: string
    priority?: string
    search?: string
    weekSubmittedFor?: string
    isDraft?: boolean
    page?: number
    limit?: number
  }): Promise<Task[]> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.assigneeId) queryParams.append('assigneeId', params.assigneeId)
    if (params?.projectId) queryParams.append('projectId', params.projectId)
    if (params?.priority) queryParams.append('priority', params.priority)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.weekSubmittedFor) queryParams.append('weekSubmittedFor', params.weekSubmittedFor)
    if (params?.isDraft !== undefined) queryParams.append('isDraft', params.isDraft.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const url = queryString ? `/v1/tasks?${queryString}` : '/v1/tasks'
    return apiClient.get<Task[]>(url)
  },

  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`/v1/tasks/${id}`)
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    return apiClient.post<Task>("/v1/tasks", data)
  },

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    return apiClient.patch<Task>(`/v1/tasks/${id}`, data)
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete(`/v1/tasks/${id}`)
  },

  async addComment(taskId: string, content: string): Promise<TaskComment> {
    return apiClient.post(`/v1/tasks/${taskId}/comments`, { content })
  },

  async updateComment(taskId: string, commentId: string, content: string): Promise<TaskComment> {
    return apiClient.patch(`/v1/tasks/${taskId}/comments/${commentId}`, { content })
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/v1/tasks/${taskId}/comments/${commentId}`)
  },

  async uploadAttachment(taskId: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.post(`/v1/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  async getTasksByProject(projectId: string, params?: {
    status?: string
    assigneeId?: string
    priority?: string
    search?: string
    weekSubmittedFor?: string
    isDraft?: boolean
    page?: number
    limit?: number
  }): Promise<Task[]> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.assigneeId) queryParams.append('assigneeId', params.assigneeId)
    if (params?.priority) queryParams.append('priority', params.priority)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.weekSubmittedFor) queryParams.append('weekSubmittedFor', params.weekSubmittedFor)
    if (params?.isDraft !== undefined) queryParams.append('isDraft', params.isDraft.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const url = queryString ? `/v1/tasks/project/${projectId}?${queryString}` : `/v1/tasks/project/${projectId}`
    return apiClient.get<Task[]>(url)
  },

  async getTasksByUser(userId: string, params?: {
    status?: string
    priority?: string
    search?: string
    weekSubmittedFor?: string
    isDraft?: boolean
    page?: number
    limit?: number
  }): Promise<Task[]> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.priority) queryParams.append('priority', params.priority)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.weekSubmittedFor) queryParams.append('weekSubmittedFor', params.weekSubmittedFor)
    if (params?.isDraft !== undefined) queryParams.append('isDraft', params.isDraft.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const url = queryString ? `/v1/tasks/user/${userId}?${queryString}` : `/v1/tasks/user/${userId}`
    return apiClient.get<Task[]>(url)
  },
}
