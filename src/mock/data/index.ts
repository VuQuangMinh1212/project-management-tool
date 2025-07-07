// Central export for all mock data aligned with database schema
export { mockUsers, mockUsersWithStats, demoAccounts } from "./users";
export { mockPlans, mockPlansWithDetails } from "./plans";
export { mockTasks, mockTasksWithDetails } from "./tasks";

// Helper functions for working with the mock data
import { mockUsers, mockUsersWithStats } from "./users";
import { mockPlans, mockPlansWithDetails } from "./plans";
import { mockTasks, mockTasksWithDetails } from "./tasks";
import type {
  UserWithStats,
  PlanWithDetails,
  DatabaseTaskWithDetails,
} from "@/types/database";

/**
 * Get user statistics computed from tasks and plans
 */
export const getUserStats = (userId: string) => {
  const userTasks = mockTasksWithDetails.filter(
    (task) =>
      mockPlans.find((plan) => plan.id === task.plan_id)?.user_id === userId
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

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    averageProgress,
    completionRate,
  };
};

/**
 * Get plans with computed task statistics
 */
export const getPlansWithStats = (): PlanWithDetails[] => {
  return mockPlans.map((plan) => {
    const planTasks = mockTasks.filter((task) => task.plan_id === plan.id);
    const completedTasks = planTasks.filter((task) => task.status === "done");
    const averageProgress =
      planTasks.length > 0
        ? Math.round(
            planTasks.reduce((sum, task) => sum + task.progress, 0) /
              planTasks.length
          )
        : 0;

    const user = mockUsers.find((u) => u.id === plan.user_id);

    return {
      ...plan,
      user_name: user?.name || "Unknown User",
      user_avatar: "/placeholder.svg",
      tasks: mockTasksWithDetails.filter((task) => task.plan_id === plan.id),
      taskCount: planTasks.length,
      completedTaskCount: completedTasks.length,
      averageProgress,
    };
  });
};

/**
 * Get tasks for a specific user
 */
export const getUserTasks = (userId: string): DatabaseTaskWithDetails[] => {
  const userPlanIds = mockPlans
    .filter((plan) => plan.user_id === userId)
    .map((plan) => plan.id);

  return mockTasksWithDetails.filter((task) =>
    userPlanIds.includes(task.plan_id)
  );
};

/**
 * Get tasks for a specific plan
 */
export const getPlanTasks = (planId: string): DatabaseTaskWithDetails[] => {
  return mockTasksWithDetails.filter((task) => task.plan_id === planId);
};

/**
 * Get current week's plans
 */
export const getCurrentWeekPlans = (): PlanWithDetails[] => {
  const now = new Date();
  const currentWeekStart = new Date(now);
  const day = currentWeekStart.getDay();
  const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
  currentWeekStart.setDate(diff);
  currentWeekStart.setHours(0, 0, 0, 0);

  const weekStartStr = currentWeekStart.toISOString().split("T")[0];

  return getPlansWithStats().filter((plan) => plan.week_start === weekStartStr);
};

/**
 * Get pending plans (for manager approval)
 */
export const getPendingPlans = (): PlanWithDetails[] => {
  return getPlansWithStats().filter((plan) => plan.status === "pending");
};
