// Database-aligned type definitions

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string; // Only on backend
  role: "employee" | "manager";
  created_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  week_start: string; // ISO date string (YYYY-MM-DD)
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  manager_comment?: string;
  created_at: string;
}

export interface DatabaseTask {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  status: "todo" | "in_progress" | "done";
  start_date?: string; // ISO date string (YYYY-MM-DD)
  end_date?: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

// Extended types for UI with joined data
export interface UserWithStats extends User {
  stats?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    averageProgress: number;
    completionRate: number;
  };
  avatar?: string; // UI-only field
  lastActive?: string;
}

export interface PlanWithDetails extends Plan {
  user_name?: string; // Joined from users table
  user_avatar?: string; // UI-only
  tasks?: DatabaseTaskWithDetails[];
  taskCount?: number;
  completedTaskCount?: number;
  averageProgress?: number;
}

export interface DatabaseTaskWithDetails extends DatabaseTask {
  plan_title?: string; // Joined from plans table
  user_name?: string; // Joined from users table via plans
  user_avatar?: string; // UI-only
}

// Enums matching database constraints
export const DatabaseUserRole = {
  EMPLOYEE: "employee" as const,
  MANAGER: "manager" as const,
} as const;

export const DatabasePlanStatus = {
  PENDING: "pending" as const,
  APPROVED: "approved" as const,
  REJECTED: "rejected" as const,
} as const;

export const DatabaseTaskStatus = {
  TODO: "todo" as const,
  IN_PROGRESS: "in_progress" as const,
  DONE: "done" as const,
} as const;

export type DatabaseUserRoleType =
  (typeof DatabaseUserRole)[keyof typeof DatabaseUserRole];
export type DatabasePlanStatusType =
  (typeof DatabasePlanStatus)[keyof typeof DatabasePlanStatus];
export type DatabaseTaskStatusType =
  (typeof DatabaseTaskStatus)[keyof typeof DatabaseTaskStatus];
