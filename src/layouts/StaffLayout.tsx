"use client"

import type { ReactNode } from "react"
import { Sidebar } from "@/components/shared/layout/Sidebar"
import { TopNavbar } from "@/components/shared/layout/TopNavbar"
import { Breadcrumbs } from "@/components/shared/layout/Breadcrumbs"
import { useAuth } from "@/hooks/auth/useAuth"

interface StaffLayoutProps {
  children: ReactNode
}

export function StaffLayout({ children }: StaffLayoutProps) {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Breadcrumbs />
            <div className="mt-4">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
