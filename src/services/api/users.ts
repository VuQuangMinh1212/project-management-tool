import { apiClient } from "@/lib/api/client"
import type { User } from "@/types/auth"
import type { CreateUserData, UpdateUserData } from "@/types/user"

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

export const userService = {
  async getUsers(role?: string): Promise<User[]> {
    const url = role ? `/users?role=${role}` : "/users";
    return apiClient.get<User[]>(url);
  },

  async createUser(data: CreateUserData): Promise<User> {
    return apiClient.post<User>("/users", data);
  },

  async getUser(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`)
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return apiClient.patch(`/users/${id}`, data)
  },

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/v1/users/${id}`)
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

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    return apiClient.post('/v1/auth/change-password', data)
  },

  async getProjectEmployees(projectId: string): Promise<User[]> {
    return apiClient.get<User[]>(`/v1/projects/${projectId}/employees`)
  },

  async getManagerEmployees(managerId: string): Promise<User[]> {
    return apiClient.get<User[]>(`/v1/users/manager/${managerId}/employees`)
  },
}
