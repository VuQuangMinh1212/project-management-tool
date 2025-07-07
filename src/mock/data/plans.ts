import type { Plan, PlanWithDetails } from "@/types/database";

// Helper function to get week start (Monday)
const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  return d.toISOString().split("T")[0];
};

// Generate dates for current and previous weeks
const currentWeek = getWeekStart(new Date());
const lastWeek = getWeekStart(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
const nextWeek = getWeekStart(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

export const mockPlans: Plan[] = [
  // Current week plans
  {
    id: "plan1",
    user_id: "user1",
    week_start: currentWeek,
    title: "Homepage Redesign & Bug Fixes",
    description:
      "Focus on completing the homepage redesign project and fixing critical authentication bugs. This week's priorities include finalizing wireframes and implementing new login system.",
    status: "approved",
    manager_comment:
      "Good plan! Focus on the auth bug first as it's blocking users.",
    created_at: "2025-07-01T09:00:00Z",
  },
  {
    id: "plan2",
    user_id: "user2",
    week_start: currentWeek,
    title: "Database Optimization & User Testing",
    description:
      "Optimize slow database queries and conduct user testing sessions for new features. Target 50% performance improvement in query response times.",
    status: "approved",
    manager_comment:
      "Excellent focus on performance. Let me know if you need help with query optimization.",
    created_at: "2025-07-01T10:00:00Z",
  },
  {
    id: "plan3",
    user_id: "user3",
    week_start: currentWeek,
    title: "Mobile App Wireframes & Planning",
    description:
      "Create wireframes for mobile app and plan the implementation roadmap. Research best practices for React Native development.",
    status: "pending",
    created_at: "2025-07-01T11:00:00Z",
  },

  // Next week plans
  {
    id: "plan4",
    user_id: "user1",
    week_start: nextWeek,
    title: "CI/CD Pipeline & Documentation",
    description:
      "Set up automated deployment pipeline and update API documentation. Focus on DevOps improvements and team productivity.",
    status: "pending",
    created_at: "2025-07-07T14:00:00Z",
  },
  {
    id: "plan5",
    user_id: "user2",
    week_start: nextWeek,
    title: "Advanced Analytics Dashboard",
    description:
      "Develop comprehensive analytics dashboard with real-time metrics and custom reporting features.",
    status: "pending",
    created_at: "2025-07-07T15:00:00Z",
  },

  // Last week plans (completed)
  {
    id: "plan6",
    user_id: "user1",
    week_start: lastWeek,
    title: "Project Setup & Initial Development",
    description:
      "Set up project structure, implement basic authentication, and create initial components.",
    status: "approved",
    manager_comment: "Great work on the initial setup!",
    created_at: "2024-01-01T09:00:00Z",
  },
  {
    id: "plan7",
    user_id: "user2",
    week_start: lastWeek,
    title: "Database Design & API Development",
    description:
      "Design database schema and implement core API endpoints for user and task management.",
    status: "approved",
    manager_comment: "Solid database design approach.",
    created_at: "2024-01-01T10:00:00Z",
  },
];

// Extended plans with computed fields for UI
export const mockPlansWithDetails: PlanWithDetails[] = mockPlans.map((plan) => {
  const user =
    plan.user_id === "user1"
      ? { name: "John Doe", avatar: "/placeholder.svg" }
      : plan.user_id === "user2"
      ? { name: "Jane Smith", avatar: "/placeholder.svg" }
      : plan.user_id === "user3"
      ? { name: "Bob Johnson", avatar: "/placeholder.svg" }
      : { name: "Unknown User", avatar: "/placeholder.svg" };

  return {
    ...plan,
    user_name: user.name,
    user_avatar: user.avatar,
    // These will be computed from tasks when needed
    taskCount: 0,
    completedTaskCount: 0,
    averageProgress: 0,
  };
});
