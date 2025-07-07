import { apiClient } from "@/lib/api/client"
import type { User } from "@/types/auth"

export interface UserFilters {
  role?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  totalPages: number
}

export const usersService = {
  async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    return apiClient.get("/users", { params: filters })
  },

  async getUser(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`)
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return apiClient.patch(`/users/${id}`, data)
  },

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`)
  },

  async inviteUser(data: { email: string; role: string }): Promise<void> {
    return apiClient.post("/users/invite", data)
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    return apiClient.patch(`/users/${id}/role`, { role })
  },

  async getUserStats(id: string): Promise<{
    tasksAssigned: number
    tasksCompleted: number
    productivity: number
  }> {
    return apiClient.get(`/users/${id}/stats`)
  },
}
