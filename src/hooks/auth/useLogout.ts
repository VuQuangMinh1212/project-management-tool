"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authService } from "@/services/api/auth"
import { removeAuthToken } from "@/lib/auth/token"

interface UseLogoutOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  redirectTo?: string
}

export function useLogout(options: UseLogoutOptions = {}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Call logout API (optional - for server-side cleanup)
      try {
        await authService.logout()
      } catch (error) {
        // Continue with client-side logout even if server call fails
        console.warn("Server logout failed:", error)
      }
    },
    onSuccess: () => {
      // Clear auth token
      removeAuthToken()

      // Clear all cached queries
      queryClient.clear()

      // Call success callback
      options.onSuccess?.()

      // Redirect to login or specified path
      const redirectPath = options.redirectTo || "/login"
      router.push(redirectPath)
    },
    onError: (error: Error) => {
      console.error("Logout error:", error)

      // Even if logout fails, clear local state
      removeAuthToken()
      queryClient.clear()

      options.onError?.(error)

      // Still redirect to login
      const redirectPath = options.redirectTo || "/login"
      router.push(redirectPath)
    },
  })

  const logout = () => {
    logoutMutation.mutate()
  }

  // Force logout without API call (for emergency situations)
  const forceLogout = () => {
    removeAuthToken()
    queryClient.clear()
    options.onSuccess?.()
    const redirectPath = options.redirectTo || "/login"
    router.push(redirectPath)
  }

  return {
    logout,
    forceLogout,
    isLoading: logoutMutation.isPending,
    isError: logoutMutation.isError,
  }
}
