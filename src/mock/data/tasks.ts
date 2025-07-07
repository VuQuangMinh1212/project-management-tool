import type { DatabaseTask, DatabaseTaskWithDetails } from "@/types/database";

export const mockTasks: DatabaseTask[] = [
  // Tasks for plan1 (John's current week - Homepage Redesign & Bug Fixes)
  {
    id: "task1",
    plan_id: "plan1",
    title: "Update homepage design",
    description:
      "Redesign the homepage to match the new brand guidelines and improve user experience",
    progress: 75,
    status: "in_progress",
    start_date: "2025-07-01",
    end_date: "2025-07-05",
    created_at: "2025-07-01T09:00:00Z",
    updated_at: "2025-07-03T15:30:00Z",
  },
  {
    id: "task2",
    plan_id: "plan1",
    title: "Fix login authentication bug",
    description:
      "Users are unable to login with valid credentials - critical bug affecting all users",
    progress: 100,
    status: "done",
    start_date: "2025-07-01",
    end_date: "2025-07-03",
    created_at: "2025-07-01T09:30:00Z",
    updated_at: "2025-07-03T16:00:00Z",
  },
  {
    id: "task3",
    plan_id: "plan1",
    title: "Create homepage wireframes",
    description: "Design wireframes for the new homepage layout and user flow",
    progress: 90,
    status: "in_progress",
    start_date: "2025-07-02",
    end_date: "2025-07-04",
    created_at: "2025-07-01T10:00:00Z",
    updated_at: "2025-07-04T11:00:00Z",
  },

  // Tasks for plan2 (Jane's current week - Database Optimization & User Testing)
  {
    id: "task4",
    plan_id: "plan2",
    title: "Optimize database queries",
    description:
      "Improve performance of slow database queries, target 50% improvement in response times",
    progress: 60,
    status: "in_progress",
    start_date: "2025-07-01",
    end_date: "2025-07-07",
    created_at: "2025-07-01T10:30:00Z",
    updated_at: "2025-07-05T14:00:00Z",
  },
  {
    id: "task5",
    plan_id: "plan2",
    title: "User testing for new features",
    description:
      "Conduct user testing sessions for recently developed features and gather feedback",
    progress: 30,
    status: "in_progress",
    start_date: "2025-07-03",
    end_date: "2025-07-08",
    created_at: "2025-07-01T11:00:00Z",
    updated_at: "2025-07-04T09:00:00Z",
  },
  {
    id: "task6",
    plan_id: "plan2",
    title: "Performance monitoring setup",
    description:
      "Set up monitoring tools to track database performance metrics",
    progress: 100,
    status: "done",
    start_date: "2025-07-01",
    end_date: "2025-07-02",
    created_at: "2025-07-01T11:30:00Z",
    updated_at: "2025-07-02T17:00:00Z",
  },

  // Tasks for plan3 (Bob's current week - Mobile App Wireframes)
  {
    id: "task7",
    plan_id: "plan3",
    title: "Research mobile UI patterns",
    description:
      "Research best practices and UI patterns for mobile task management apps",
    progress: 50,
    status: "in_progress",
    start_date: "2025-07-01",
    end_date: "2025-07-05",
    created_at: "2025-07-01T12:00:00Z",
    updated_at: "2025-07-03T16:30:00Z",
  },
  {
    id: "task8",
    plan_id: "plan3",
    title: "Create mobile wireframes",
    description:
      "Design wireframes for key mobile app screens including dashboard, tasks, and profile",
    progress: 20,
    status: "todo",
    start_date: "2025-07-03",
    end_date: "2025-07-07",
    created_at: "2025-07-01T12:30:00Z",
    updated_at: "2025-07-01T12:30:00Z",
  },
  {
    id: "task9",
    plan_id: "plan3",
    title: "Mobile app technical planning",
    description:
      "Create technical roadmap and architecture plan for React Native mobile app",
    progress: 0,
    status: "todo",
    start_date: "2025-07-05",
    end_date: "2025-07-08",
    created_at: "2025-07-01T13:00:00Z",
    updated_at: "2025-07-01T13:00:00Z",
  },

  // Tasks for plan6 (John's last week - completed)
  {
    id: "task10",
    plan_id: "plan6",
    title: "Project initialization",
    description:
      "Set up Next.js project with TypeScript, TailwindCSS, and initial folder structure",
    progress: 100,
    status: "done",
    start_date: "2025-07-01",
    end_date: "2024-01-02",
    created_at: "2025-07-01T09:00:00Z",
    updated_at: "2024-01-02T17:00:00Z",
  },
  {
    id: "task11",
    plan_id: "plan6",
    title: "Authentication system setup",
    description:
      "Implement JWT-based authentication with login/register functionality",
    progress: 100,
    status: "done",
    start_date: "2024-01-02",
    end_date: "2025-07-05",
    created_at: "2025-07-01T09:30:00Z",
    updated_at: "2025-07-05T16:00:00Z",
  },

  // Tasks for plan7 (Jane's last week - completed)
  {
    id: "task12",
    plan_id: "plan7",
    title: "Database schema design",
    description:
      "Design PostgreSQL database schema for users, plans, and tasks",
    progress: 100,
    status: "done",
    start_date: "2025-07-01",
    end_date: "2025-07-03",
    created_at: "2025-07-01T10:00:00Z",
    updated_at: "2025-07-03T15:00:00Z",
  },
  {
    id: "task13",
    plan_id: "plan7",
    title: "Core API endpoints",
    description:
      "Implement REST API endpoints for user management and authentication",
    progress: 100,
    status: "done",
    start_date: "2025-07-03",
    end_date: "2025-07-07",
    created_at: "2025-07-01T10:30:00Z",
    updated_at: "2025-07-07T18:00:00Z",
  },

  // Recent tasks (current week)
  {
    id: "task14",
    plan_id: "plan1",
    title: "Implement responsive navigation",
    description: "Update the main navigation to work across all device sizes",
    progress: 40,
    status: "in_progress",
    start_date: "2025-07-04",
    end_date: "2025-07-06",
    created_at: "2025-07-04T09:00:00Z",
    updated_at: "2025-07-04T15:00:00Z",
  },
  {
    id: "task15",
    plan_id: "plan2",
    title: "Performance monitoring setup",
    description: "Set up monitoring tools to track application performance",
    progress: 100,
    status: "done",
    start_date: "2025-07-03",
    end_date: "2025-07-04",
    created_at: "2025-07-03T08:00:00Z",
    updated_at: "2025-07-04T17:00:00Z",
  },
  {
    id: "task16",
    plan_id: "plan3",
    title: "Mobile prototype testing",
    description: "Test mobile app prototype with focus groups",
    progress: 25,
    status: "in_progress",
    start_date: "2025-07-04",
    end_date: "2025-07-08",
    created_at: "2025-07-04T10:00:00Z",
    updated_at: "2025-07-04T16:00:00Z",
  },
];

// Extended tasks with joined data for UI
export const mockTasksWithDetails: DatabaseTaskWithDetails[] = mockTasks.map(
  (task) => {
    // Get plan info
    const planInfo = {
      plan1: { title: "Homepage Redesign & Bug Fixes", user: "John Doe" },
      plan2: {
        title: "Database Optimization & User Testing",
        user: "Jane Smith",
      },
      plan3: { title: "Mobile App Wireframes & Planning", user: "Bob Johnson" },
      plan4: { title: "CI/CD Pipeline & Documentation", user: "John Doe" },
      plan5: { title: "Advanced Analytics Dashboard", user: "Jane Smith" },
      plan6: { title: "Project Setup & Initial Development", user: "John Doe" },
      plan7: { title: "Database Design & API Development", user: "Jane Smith" },
    }[task.plan_id] || { title: "Unknown Plan", user: "Unknown User" };

    return {
      ...task,
      plan_title: planInfo.title,
      user_name: planInfo.user,
      user_avatar: "/placeholder.svg",
    };
  }
);
