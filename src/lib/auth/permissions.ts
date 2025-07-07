import type React from "react"
import type { User, UserRole } from "@/types/user"
import type { Task } from "@/types/task"
import type { Project } from "@/types/project"

/**
 * Permission types for different actions
 */
export type Permission =
  | "tasks:read"
  | "tasks:create"
  | "tasks:update"
  | "tasks:delete"
  | "tasks:assign"
  | "tasks:approve"
  | "projects:read"
  | "projects:create"
  | "projects:update"
  | "projects:delete"
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "reports:read"
  | "reports:create"
  | "settings:read"
  | "settings:update"

/**
 * Role-based permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "tasks:assign",
    "tasks:approve",
    "projects:read",
    "projects:create",
    "projects:update",
    "projects:delete",
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "reports:read",
    "reports:create",
    "settings:read",
    "settings:update",
  ],
  manager: [
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:assign",
    "tasks:approve",
    "projects:read",
    "projects:create",
    "projects:update",
    "users:read",
    "users:update",
    "reports:read",
    "reports:create",
    "settings:read",
  ],
  staff: ["tasks:read", "tasks:update", "projects:read"],
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false

  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false

  return permissions.some((permission) => hasPermission(user, permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false

  return permissions.every((permission) => hasPermission(user, permission))
}

/**
 * Check if user can access a specific task
 */
export function canAccessTask(user: User | null, task: Task): boolean {
  if (!user) return false

  // Admin and managers can access all tasks
  if (user.role === "admin" || user.role === "manager") {
    return true
  }

  // Staff can only access their own tasks
  if (user.role === "staff") {
    return task.assignedTo === user.id || task.createdBy === user.id
  }

  return false
}

/**
 * Check if user can modify a specific task
 */
export function canModifyTask(user: User | null, task: Task): boolean {
  if (!user) return false

  // Admin can modify all tasks
  if (user.role === "admin") {
    return true
  }

  // Managers can modify tasks in their projects
  if (user.role === "manager") {
    return hasPermission(user, "tasks:update")
  }

  // Staff can only modify their assigned tasks (not completed ones)
  if (user.role === "staff") {
    return task.assignedTo === user.id && task.status !== "completed"
  }

  return false
}

/**
 * Check if user can delete a specific task
 */
export function canDeleteTask(user: User | null, task: Task): boolean {
  if (!user) return false

  // Only admin and managers can delete tasks
  if (user.role === "admin") {
    return true
  }

  if (user.role === "manager") {
    return hasPermission(user, "tasks:delete")
  }

  return false
}

/**
 * Check if user can access a specific project
 */
export function canAccessProject(user: User | null, project: Project): boolean {
  if (!user) return false

  // Admin can access all projects
  if (user.role === "admin") {
    return true
  }

  // Managers can access projects they manage
  if (user.role === "manager") {
    return project.managerId === user.id
  }

  // Staff can access projects they're assigned to
  if (user.role === "staff") {
    return project.teamMembers?.includes(user.id) || false
  }

  return false
}

/**
 * Check if user can modify a specific project
 */
export function canModifyProject(user: User | null, project: Project): boolean {
  if (!user) return false

  // Admin can modify all projects
  if (user.role === "admin") {
    return true
  }

  // Managers can modify their own projects
  if (user.role === "manager") {
    return project.managerId === user.id && hasPermission(user, "projects:update")
  }

  return false
}

/**
 * Get user's accessible task statuses for filtering
 */
export function getAccessibleTaskStatuses(user: User | null): string[] {
  if (!user) return []

  if (user.role === "admin" || user.role === "manager") {
    return ["pending", "in_progress", "review", "completed", "cancelled"]
  }

  // Staff can see most statuses but might have limited access to some
  return ["pending", "in_progress", "review", "completed"]
}

/**
 * Get user's accessible project statuses for filtering
 */
export function getAccessibleProjectStatuses(user: User | null): string[] {
  if (!user) return []

  if (user.role === "admin" || user.role === "manager") {
    return ["planning", "active", "on_hold", "completed", "cancelled"]
  }

  return ["active", "completed"]
}

/**
 * Check if user can approve tasks
 */
export function canApproveTask(user: User | null, task: Task): boolean {
  if (!user) return false

  // Only managers and admins can approve tasks
  if (user.role === "admin") {
    return true
  }

  if (user.role === "manager") {
    return hasPermission(user, "tasks:approve") && task.status === "review"
  }

  return false
}

/**
 * Check if user can assign tasks to others
 */
export function canAssignTask(user: User | null): boolean {
  if (!user) return false

  return hasPermission(user, "tasks:assign")
}

/**
 * Check if user can view reports
 */
export function canViewReports(user: User | null): boolean {
  if (!user) return false

  return hasPermission(user, "reports:read")
}

/**
 * Check if user can create reports
 */
export function canCreateReports(user: User | null): boolean {
  if (!user) return false

  return hasPermission(user, "reports:create")
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(user: User | null): boolean {
  if (!user) return false

  return hasPermission(user, "users:update") || hasPermission(user, "users:create")
}

/**
 * Get filtered menu items based on user permissions
 */
export function getAccessibleMenuItems(user: User | null) {
  if (!user) return []

  const menuItems = []

  // Dashboard is accessible to all authenticated users
  menuItems.push({
    name: "Dashboard",
    href: `/${user.role}/dashboard`,
    permission: null,
  })

  // Tasks
  if (hasPermission(user, "tasks:read")) {
    menuItems.push({
      name: "Tasks",
      href: `/${user.role}/tasks`,
      permission: "tasks:read",
    })
  }

  // Projects
  if (hasPermission(user, "projects:read")) {
    menuItems.push({
      name: "Projects",
      href: `/${user.role}/projects`,
      permission: "projects:read",
    })
  }

  // Team (for managers and admins)
  if (user.role === "manager" || user.role === "admin") {
    menuItems.push({
      name: "Team",
      href: `/${user.role}/team`,
      permission: "users:read",
    })
  }

  // Reports
  if (hasPermission(user, "reports:read")) {
    menuItems.push({
      name: "Reports",
      href: `/${user.role}/reports`,
      permission: "reports:read",
    })
  }

  // Settings (for admins and managers)
  if (hasPermission(user, "settings:read")) {
    menuItems.push({
      name: "Settings",
      href: `/${user.role}/settings`,
      permission: "settings:read",
    })
  }

  return menuItems
}

/**
 * Permission guard HOC props
 */
export interface PermissionGuardProps {
  user: User | null
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  requireAll?: boolean
}

/**
 * Check permissions for permission guard
 */
export function checkPermissionGuard({
  user,
  permission,
  requireAll = false,
}: Omit<PermissionGuardProps, "fallback">): boolean {
  if (!user) return false

  if (Array.isArray(permission)) {
    return requireAll ? hasAllPermissions(user, permission) : hasAnyPermission(user, permission)
  }

  return hasPermission(user, permission)
}
