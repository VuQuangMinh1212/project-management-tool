"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/useAuth"
import { ROUTES } from "@/constants/routes"
import { UserRole } from "@/types/auth"

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: UserRole
  fallbackRoute?: string
}

export function AuthGuard({ children, requiredRole, fallbackRoute }: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
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
  }, [isAuthenticated, user, isLoading, requiredRole, fallbackRoute, router])

  if (isLoading) {
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
