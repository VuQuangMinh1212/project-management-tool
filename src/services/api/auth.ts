import { apiClient } from "@/lib/api/client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register", data);
  },

  async logout(): Promise<void> {
    return apiClient.post("/auth/logout");
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/profile");
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.patch<User>("/auth/profile", data);
  },
};
