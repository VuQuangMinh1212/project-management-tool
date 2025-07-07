export enum UserRole {
  STAFF = "staff",
  MANAGER = "manager",
  ADMIN = "admin",
}

export const ROLE_PERMISSIONS = {
  [UserRole.STAFF]: ["view_own_tasks", "create_task", "update_own_task", "view_own_profile", "update_own_profile"],
  [UserRole.MANAGER]: [
    "view_own_tasks",
    "create_task",
    "update_own_task",
    "view_own_profile",
    "update_own_profile",
    "view_team_tasks",
    "assign_tasks",
    "approve_tasks",
    "view_reports",
    "manage_team",
  ],
  [UserRole.ADMIN]: [
    "view_own_tasks",
    "create_task",
    "update_own_task",
    "view_own_profile",
    "update_own_profile",
    "view_team_tasks",
    "assign_tasks",
    "approve_tasks",
    "view_reports",
    "manage_team",
    "manage_users",
    "system_settings",
  ],
} as const

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.STAFF:
      return "Staff Member"
    case UserRole.MANAGER:
      return "Manager"
    case UserRole.ADMIN:
      return "Administrator"
    default:
      return "Unknown"
  }
}

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}
