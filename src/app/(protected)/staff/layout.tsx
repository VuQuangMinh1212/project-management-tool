"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/auth/useAuth"
import { UserRole } from "@/types/auth"
import { redirect } from "next/navigation"
import { ROUTES } from "@/constants/routes"

interface StaffLayoutProps {
  children: ReactNode
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user, isAuthenticated } = useAuth()

  if (isAuthenticated && user?.role !== UserRole.STAFF) {
    redirect(ROUTES.MANAGER.DASHBOARD)
  }

  return <>{children}</>
}
