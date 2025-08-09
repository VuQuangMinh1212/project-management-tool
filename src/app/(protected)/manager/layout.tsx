"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/useAuth"
import { ROUTES } from "@/constants/routes"

interface ManagerLayoutProps {
  children: ReactNode
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // For now, allow employees to access manager dashboard for testing
      // TODO: Implement proper role-based access control when manager users are created
      console.log("User role:", user.role);
    }
  }, [user, isAuthenticated, isLoading, router])

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

  return <>{children}</>
}
