"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService, CreateUserData, UpdateUserData } from "@/services/api/users"
import type { User } from "@/types/auth"

// Get all users
export function useUsers(role?: string) {
  return useQuery<User[], Error>({
    queryKey: ['users', role],
    queryFn: () => userService.getUsers(role),
  })
}

// Get single user
export function useUser(userId: string) {
  return useQuery<User, Error>({
    queryKey: ["users", userId],
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserData) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error)
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) => userService.updateUser(userId, data),
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
      queryClient.setQueryData(["users", variables.userId], updatedUser)
    },
    onError: (error: Error) => {
      console.error("Error updating user:", error)
    },
  })
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error)
    },
  })
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => userService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
    },
  })
}

// Get user stats
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ["user-stats", userId],
    queryFn: () => userService.getUserStats(userId),
    enabled: !!userId,
  })
}