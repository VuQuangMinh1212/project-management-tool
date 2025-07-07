"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authService } from "@/services/api/auth"
import { setAuthToken } from "@/lib/auth/token"
import { useAuth } from "./useAuth"
import type { LoginCredentials } from "@/types/auth"

interface UseLoginOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  redirectTo?: string
}

export function useLogin(options: UseLoginOptions = {}) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { refetch } = useAuth()

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      setError(null)
      return authService.login(credentials)
    },
    onSuccess: async (response) => {
      try {
        // Store the auth token
        setAuthToken(response.token)

        // Refetch user data
        await refetch()

        // Call success callback
        options.onSuccess?.()

        // Redirect based on user role or provided redirect
        const redirectPath = options.redirectTo || getDefaultRedirectPath(response.user.role)
        router.push(redirectPath)
      } catch (error) {
        console.error("Login success handler error:", error)
        setError("Login successful but failed to complete setup")
      }
    },
    onError: (error: Error) => {
      console.error("Login error:", error)
      setError(error.message || "Login failed")
      options.onError?.(error)
    },
  })

  const login = (credentials: LoginCredentials) => {
    loginMutation.mutate(credentials)
  }

  const clearError = () => {
    setError(null)
  }

  return {
    login,
    isLoading: loginMutation.isPending,
    error,
    clearError,
    isSuccess: loginMutation.isSuccess,
    isError: loginMutation.isError,
  }
}

function getDefaultRedirectPath(role: string): string {
  switch (role) {
    case "admin":
    case "manager":
      return "/manager/dashboard"
    case "staff":
    default:
      return "/staff/dashboard"
  }
}
