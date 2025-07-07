"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersService } from "@/services/api/users"
import type { CreateUserData, UpdateUserData } from "@/types/user"

// Get all users
export function useUsers(filters?: {
  role?: string
  department?: string
  status?: string
  search?: string
}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersService.getUsers(filters),
  })
}

// Get single user
export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => usersService.getUserById(userId),
    enabled: !!userId,
  })
}

// Get current user profile
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => usersService.getProfile(),
  })
}

// Get team members
export function useTeamMembers(teamId?: string) {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => usersService.getTeamMembers(teamId),
    enabled: !!teamId,
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserData) => usersService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) => usersService.updateUser(userId, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.setQueryData(["users", updatedUser.id], updatedUser)
    },
  })
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserData) => usersService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile"], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

// Change user status mutation
export function useChangeUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "inactive" | "suspended" }) =>
      usersService.changeUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

// Reset user password mutation
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (userId: string) => usersService.resetPassword(userId),
  })
}

// Get user activity
export function useUserActivity(
  userId: string,
  filters?: {
    startDate?: string
    endDate?: string
    type?: string
  },
) {
  return useQuery({
    queryKey: ["user-activity", userId, filters],
    queryFn: () => usersService.getUserActivity(userId, filters),
    enabled: !!userId,
  })
}

// Get user statistics
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ["user-stats", userId],
    queryFn: () => usersService.getUserStats(userId),
    enabled: !!userId,
  })
}
