"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, Users, BarChart3, LogOut, ChevronLeft, ChevronRight, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/auth/useAuth"
import { ROUTES } from "@/constants/routes"
import { UserRole } from "@/types/auth"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const staffNavItems = [
    {
      title: "Nhiệm Vụ Của Tôi",
      href: ROUTES.STAFF.TASKS,
      icon: CheckSquare,
    },
    {
      title: "Bảng Điều Khiển",
      href: ROUTES.STAFF.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      title: "Hồ Sơ",
      href: ROUTES.STAFF.PROFILE,
      icon: User,
    },
  ]

  const managerNavItems = [
    {
      title: "Bảng điều khiển",
      href: ROUTES.MANAGER.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      title: "Nhóm",
      href: ROUTES.MANAGER.TEAM,
      icon: Users,
    },
    {
      title: "Phê duyệt",
      href: ROUTES.MANAGER.APPROVALS,
      icon: CheckSquare,
    },
  ]

  const navItems = user?.role === UserRole.MANAGER ? managerNavItems : staffNavItems

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && <h2 className="text-lg font-semibold">TaskFlow</h2>}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", collapsed && "px-2", isActive && "bg-secondary")}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.title}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "space-x-3")}>
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full mt-2 justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        )}
      </div>
    </div>
  )
}
