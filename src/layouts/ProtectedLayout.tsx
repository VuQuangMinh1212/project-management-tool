"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/useAuth"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { SkeletonLoader } from "@/components/shared/ui/SkeletonLoader"
import { StaffLayout } from "./StaffLayout"
import { ManagerLayout } from "./ManagerLayout"

interface ProtectedLayoutProps {
  children: ReactNode
  requiredRole?: "staff" | "manager" | "admin"
}

export function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <SkeletonLoader variant="dashboard" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Role-based access control
  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Render appropriate layout based on user role
  const renderLayout = () => {
    switch (user.role) {
      case "manager":
      case "admin":
        return <ManagerLayout>{children}</ManagerLayout>
      case "staff":
      default:
        return <StaffLayout>{children}</StaffLayout>
    }
  }

  return <AuthGuard requiredRole={requiredRole}>{renderLayout()}</AuthGuard>
}
