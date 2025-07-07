"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/auth/useAuth"
import { UserRole } from "@/types/auth"
import { redirect } from "next/navigation"
import { ROUTES } from "@/constants/routes"

interface ManagerLayoutProps {
  children: ReactNode
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const { user, isAuthenticated } = useAuth()

  if (isAuthenticated && user?.role !== UserRole.MANAGER) {
    redirect(ROUTES.STAFF.DASHBOARD)
  }

  return <>{children}</>
}
