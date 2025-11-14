"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/useAuth"
import { ROUTES } from "@/constants/routes"
import { UserRole } from "@/types/auth"
import { enhancedTokenStorage } from "@/lib/auth/enhanced-token-storage"
import { tokenRefreshService } from "@/lib/auth/token-refresh"

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: UserRole
  fallbackRoute?: string
}

export function AuthGuard({ children, requiredRole, fallbackRoute }: AuthGuardProps) {
  const { isAuthenticated, user, isLoading, initialized, initialize } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const validateAuth = async () => {
      if (!initialized) {
        await initialize()
      }

      const token = enhancedTokenStorage.getAccessToken()
      if (token && enhancedTokenStorage.isTokenExpired(token)) {
        const newToken = await tokenRefreshService.getValidAccessToken()
        if (!newToken) {
          setChecking(false)
          router.push(fallbackRoute || ROUTES.LOGIN)
          return
        }
      }

      setChecking(false)
    }

    validateAuth()
  }, [initialized, initialize, fallbackRoute, router])

  useEffect(() => {
    if (!checking && initialized && !isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackRoute || ROUTES.LOGIN)
        return
      }

      if (requiredRole && user?.role !== requiredRole) {
        const redirectRoute = user?.role === UserRole.MANAGER ? ROUTES.MANAGER.DASHBOARD : ROUTES.STAFF.DASHBOARD
        router.push(redirectRoute)
        return
      }
    }
  }, [checking, isAuthenticated, user, isLoading, initialized, requiredRole, fallbackRoute, router])

  if (checking || !initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
