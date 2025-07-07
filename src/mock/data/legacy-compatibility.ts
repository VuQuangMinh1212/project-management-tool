// Legacy compatibility layer for gradual migration
import type { Task } from "@/types/task";
import type { DatabaseTaskWithDetails, UserWithStats } from "@/types/database";
import type { TeamMember } from "@/types/user";
import {
  mockTasksWithDetails,
  mockUsersWithStats,
  mockPlans,
} from "@/mock/data";

/**
 * Convert database-aligned task to legacy Task format for existing components
 */
export const convertToLegacyTask = (dbTask: DatabaseTaskWithDetails): Task => {
  // Find the associated plan to get user info
  const plan = mockPlans.find((p) => p.id === dbTask.plan_id);
  const user = mockUsersWithStats.find((u) => u.id === plan?.user_id);

  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status as any, // Type conversion for compatibility
    priority: "medium" as any, // Default priority for legacy support
    assigneeId: plan?.user_id || "",
    assigneeName: user?.name || "Unknown User",
    assigneeAvatar: user?.avatar,
    dueDate: dbTask.end_date,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
    tags: [],
    comments: [],
    attachments: [],
  };
};

/**
 * Convert database-aligned user to legacy TeamMember format
 */
export const convertToLegacyTeamMember = (
  dbUser: UserWithStats
): TeamMember => {
  // Get actual stats from the database-aligned data
  const userPlanIds = mockPlans
    .filter((plan) => plan.user_id === dbUser.id)
    .map((p) => p.id);
  const userTasks = mockTasksWithDetails.filter((task) =>
    userPlanIds.includes(task.plan_id)
  );

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(
    (task) => task.status === "done"
  ).length;
  const inProgressTasks = userTasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const todoTasks = userTasks.filter((task) => task.status === "todo").length;

  const averageProgress =
    totalTasks > 0
      ? Math.round(
          userTasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks
        )
      : 0;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overdueTasks = userTasks.filter(
    (task) =>
      task.end_date &&
      new Date(task.end_date) < new Date() &&
      task.status !== "done"
  ).length;

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    avatar: dbUser.avatar,
    role: dbUser.role === "employee" ? "member" : "manager",
    status: "active",
    joinedAt: dbUser.created_at,
    lastActive: dbUser.lastActive,
    stats: {
      tasksAssigned: totalTasks,
      tasksCompleted: completedTasks,
      tasksInProgress: inProgressTasks,
      tasksOverdue: overdueTasks,
      productivity: averageProgress, // Use average progress as productivity
      hoursLogged: 0, // Not tracked in new schema
      averageCompletionTime: 0, // Not tracked in new schema
      completionRate: completionRate,
    },
    preferences: {
      theme: "system",
      notifications: {
        email: true,
        push: true,
        inApp: true,
        types: [],
      },
      dashboard: {
        layout: "grid",
        widgets: [],
      },
    },
    createdAt: dbUser.created_at,
    updatedAt: dbUser.created_at,
  };
};

/**
 * Get legacy-compatible tasks for existing components
 */
export const getLegacyTasks = (): Task[] => {
  return mockTasksWithDetails.map(convertToLegacyTask);
};

/**
 * Get legacy-compatible team members for existing components
 */
export const getLegacyTeamMembers = (): TeamMember[] => {
  return mockUsersWithStats
    .filter((user) => user.role === "employee")
    .map(convertToLegacyTeamMember);
};
