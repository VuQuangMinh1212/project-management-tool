"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/types/auth";
import { authService } from "@/services/api/auth";
import { enhancedTokenStorage } from "@/lib/auth/enhanced-token-storage";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthState,
} from "@/types/auth";

interface AuthStore extends AuthState {
  login: (
    credentials: LoginCredentials & { rememberMe?: boolean }
  ) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (
        credentials: LoginCredentials & { rememberMe?: boolean }
      ) => {
        set({ isLoading: true, error: null });

        try {
          const { rememberMe, ...loginCredentials } = credentials;
          const response = await authService.login(loginCredentials);

          const user: User = {
            ...response.user,
            name: `${response.user.firstName} ${response.user.lastName}`,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Use enhanced token storage
          enhancedTokenStorage.saveTokens(response.access_token, user, {
            rememberMe,
          });

          set({
            user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          let errorMessage = "Đăng nhập thất bại";

          if (error?.response?.data?.message) {
            const backendMessage = error.response.data.message;
            // Translate common login error messages to Vietnamese
            if (
              backendMessage === "Invalid credentials" ||
              backendMessage === "Unauthorized"
            ) {
              errorMessage = "Email hoặc mật khẩu không chính xác";
            } else if (backendMessage.includes("email")) {
              errorMessage = "Email không hợp lệ";
            } else if (backendMessage.includes("password")) {
              errorMessage = "Mật khẩu không chính xác";
            } else {
              errorMessage = backendMessage;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(data);

          const user: User = {
            ...response.user,
            name: `${response.user.firstName} ${response.user.lastName}`,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Use enhanced token storage for registration
          enhancedTokenStorage.saveTokens(response.access_token, user, {
            rememberMe: false,
          });

          set({
            user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          let errorMessage = "Đăng ký thất bại";

          if (error?.response?.data?.message) {
            const backendMessage = error.response.data.message;
            // Translate common error messages to Vietnamese
            if (backendMessage === "User already exists") {
              errorMessage =
                "Email này đã được sử dụng. Vui lòng sử dụng email khác.";
            } else if (backendMessage.includes("email")) {
              errorMessage = "Email không hợp lệ";
            } else if (backendMessage.includes("password")) {
              errorMessage = "Mật khẩu không hợp lệ";
            } else {
              errorMessage = backendMessage;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        enhancedTokenStorage.clearTokens();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      initialize: async () => {
        if (typeof window === "undefined") return;

        // Check if we have valid token using enhanced storage
        if (!enhancedTokenStorage.isTokenValid()) {
          enhancedTokenStorage.clearTokens();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const token = localStorage.getItem("auth_token");
        const storedUser = enhancedTokenStorage.getStoredUser();

        // If we have stored user data, use it directly for faster loading
        if (storedUser && token) {
          set({
            user: storedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        // Only fetch from API if we don't have user data
        if (token) {
          set({ isLoading: true });

          try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const user = await authService.getCurrentUser();
            clearTimeout(timeoutId);

            const fullUser: User = {
              ...user,
              name: `${user.firstName} ${user.lastName}`,
            };

            // Update stored user info
            localStorage.setItem("user_info", JSON.stringify(fullUser));

            set({
              user: fullUser,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (apiError) {
            console.error("Failed to restore user session:", apiError);
            enhancedTokenStorage.clearTokens();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
