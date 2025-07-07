"use client"

import type { ReactNode } from "react"
import { Sidebar } from "@/components/shared/layout/Sidebar"
import { TopNavbar } from "@/components/shared/layout/TopNavbar"
import { Breadcrumbs } from "@/components/shared/layout/Breadcrumbs"

interface ManagerLayoutProps {
  children: ReactNode
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
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
