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
  const [hasValidated, setHasValidated] = useState(false)

  useEffect(() => {
    const validateAuth = async () => {
      console.log("AuthGuard validateAuth - start", { initialized, hasValidated });
      
      if (hasValidated) {
        console.log("Already validated, skipping");
        return;
      }

      if (!initialized) {
        console.log("Calling initialize...");
        await initialize()
      }

      const token = enhancedTokenStorage.getAccessToken()
      console.log("AuthGuard - token check", { hasToken: !!token, isExpired: token ? enhancedTokenStorage.isTokenExpired(token) : null });
      
      if (token && enhancedTokenStorage.isTokenExpired(token)) {
        console.log("Token expired, refreshing...");
        const newToken = await tokenRefreshService.getValidAccessToken()
        if (!newToken) {
          console.log("Refresh failed, redirecting to login");
          setChecking(false)
          setHasValidated(true)
          router.push(fallbackRoute || ROUTES.LOGIN)
          return
        }
        console.log("Token refreshed successfully");
      }

      console.log("Validation complete");
      setChecking(false)
      setHasValidated(true)
    }

    validateAuth()
  }, [])

  useEffect(() => {
    console.log("AuthGuard - second effect", { checking, initialized, isLoading, isAuthenticated, user: user?.email });
    
    if (!checking && initialized && !isLoading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push(fallbackRoute || ROUTES.LOGIN)
        return
      }

      if (requiredRole && user?.role !== requiredRole) {
        console.log("Wrong role, redirecting", { required: requiredRole, actual: user?.role });
        const redirectRoute = user?.role === UserRole.MANAGER ? ROUTES.MANAGER.DASHBOARD : ROUTES.STAFF.DASHBOARD
        router.push(redirectRoute)
        return
      }
      
      console.log("Auth check passed, rendering children");
    }
  }, [checking, isAuthenticated, user, isLoading, initialized, requiredRole, fallbackRoute, router])

  if (checking || !initialized || isLoading) {
    console.log("Showing loader", { checking, initialized, isLoading });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, returning null");
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log("Wrong role, returning null");
    return null
  }

  console.log("Rendering children");
  return <>{children}</>
}
