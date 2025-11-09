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

          enhancedTokenStorage.saveTokens(
            response.access_token,
            response.refresh_token,
            user,
            { rememberMe }
          );

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

          enhancedTokenStorage.saveTokens(
            response.access_token,
            response.refresh_token,
            user,
            { rememberMe: false }
          );

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

      logout: async () => {
        try {
          const refreshToken = enhancedTokenStorage.getRefreshToken();
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (error) {
          console.error("Logout API call failed:", error);
        } finally {
          enhancedTokenStorage.clearTokens();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
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

        set({ isLoading: true });

        const token = enhancedTokenStorage.getAccessToken();
        const storedUser = enhancedTokenStorage.getStoredUser();

        console.log("Auth initialize:", { 
          hasToken: !!token, 
          hasUser: !!storedUser, 
          isExpired: token ? enhancedTokenStorage.isTokenExpired(token) : null 
        });

        // If we have both token and user data stored, and token is not expired
        if (token && storedUser && !enhancedTokenStorage.isTokenExpired(token)) {
          console.log("Restoring authentication from storage");
          set({
            user: storedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        // If token exists but is expired, try to refresh
        if (token && enhancedTokenStorage.isTokenExpired(token)) {
          const refreshToken = enhancedTokenStorage.getRefreshToken();
          if (refreshToken) {
            try {
              const response = await authService.refreshToken(refreshToken);
              const fullUser: User = {
                ...response.user,
                name: `${response.user.firstName} ${response.user.lastName}`,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              enhancedTokenStorage.saveTokens(
                response.access_token,
                response.refresh_token,
                fullUser,
                { rememberMe: enhancedTokenStorage.getRememberMeStatus() }
              );

              set({
                user: fullUser,
                token: response.access_token,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            } catch (error) {
              console.error("Token refresh failed:", error);
            }
          }
        }

        // Clear tokens and set unauthenticated state
        enhancedTokenStorage.clearTokens();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
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
