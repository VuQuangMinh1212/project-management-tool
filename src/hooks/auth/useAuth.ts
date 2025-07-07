"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/types/auth";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthState,
} from "@/types/auth";

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const mockUser: User = {
            id: "1",
            name: "John Doe",
            email: credentials.email,
            role: credentials.email.includes("manager")
              ? UserRole.MANAGER
              : UserRole.STAFF,
            avatar: "/placeholder.svg",
            department: "Engineering",
            position: "Software Developer",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // ✅ Tạo token giả định dạng JWT
          const payload = {
            user: {
              id: mockUser.id,
              role: mockUser.role,
            },
          };
          const mockToken = `header.${btoa(JSON.stringify(payload))}.signature`;

          // ✅ Ghi token vào cookie
          document.cookie = `auth_token=${mockToken}; path=/; max-age=86400;`;

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name,
            email: data.email,
            role: data.role ?? UserRole.STAFF,
            avatar: "/placeholder.svg",
            department: "Engineering",
            position: "Software Developer",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const payload = {
            user: {
              id: mockUser.id,
              role: mockUser.role,
            },
          };
          const mockToken = `header.${btoa(JSON.stringify(payload))}.signature`;

          document.cookie = `auth_token=${mockToken}; path=/; max-age=86400;`;

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Registration failed",
          });
          throw error;
        }
      },

      logout: () => {
        document.cookie = "auth_token=; path=/; max-age=0;";
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

      initialize: () => {
        if (typeof document === "undefined") return;

        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_token="));
        if (!cookie) return;

        const token = cookie.split("=")[1];
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userRole = payload.user?.role ?? null;
          const userId = payload.user?.id ?? null;

          const restoredUser: User = {
            id: userId,
            name: "Restored User",
            email: "restored@example.com",
            role: userRole,
            avatar: "/placeholder.svg",
            department: "Engineering",
            position: "Software Developer",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            user: restoredUser,
            token,
            isAuthenticated: true,
          });
        } catch (e) {
          console.error("Failed to restore user from cookie:", e);
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
