import { apiClient } from "@/lib/api/client"
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types/auth"

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", credentials)
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register", credentials)
  },

  async logout(): Promise<void> {
    return apiClient.post("/auth/logout")
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return apiClient.post("/auth/refresh", { refreshToken })
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me")
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.patch<User>("/auth/profile", data)
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    return apiClient.post("/auth/change-password", data)
  },
}
