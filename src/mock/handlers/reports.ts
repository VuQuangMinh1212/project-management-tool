import { http, HttpResponse } from "msw"

export const reportsHandlers = [
  // Get team performance report
  http.get("/api/reports/team-performance", () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalTasks: 156,
        completedTasks: 142,
        pendingTasks: 14,
        overdueTasks: 3,
        teamMembers: [
          {
            id: "1",
            name: "John Doe",
            completedTasks: 45,
            pendingTasks: 3,
            efficiency: 94,
          },
          {
            id: "2",
            name: "Jane Smith",
            completedTasks: 38,
            pendingTasks: 5,
            efficiency: 88,
          },
          {
            id: "3",
            name: "Mike Johnson",
            completedTasks: 32,
            pendingTasks: 2,
            efficiency: 91,
          },
        ],
        weeklyProgress: [
          { week: "Week 1", completed: 35, pending: 8 },
          { week: "Week 2", completed: 42, pending: 6 },
          { week: "Week 3", completed: 38, pending: 4 },
          { week: "Week 4", completed: 27, pending: 2 },
        ],
      },
    })
  }),

  // Get productivity analytics
  http.get("/api/reports/productivity", () => {
    return HttpResponse.json({
      success: true,
      data: {
        dailyProductivity: [
          { date: "2024-01-01", tasksCompleted: 12, hoursWorked: 8 },
          { date: "2024-01-02", tasksCompleted: 15, hoursWorked: 8.5 },
          { date: "2024-01-03", tasksCompleted: 10, hoursWorked: 7.5 },
          { date: "2024-01-04", tasksCompleted: 18, hoursWorked: 9 },
          { date: "2024-01-05", tasksCompleted: 14, hoursWorked: 8 },
        ],
        averageCompletionTime: 2.5,
        mostProductiveHour: "10:00 AM",
        tasksByPriority: {
          high: 45,
          medium: 78,
          low: 33,
        },
      },
    })
  }),

  // Get project status report
  http.get("/api/reports/project-status", () => {
    return HttpResponse.json({
      success: true,
      data: {
        activeProjects: 8,
        completedProjects: 12,
        onHoldProjects: 2,
        projects: [
          {
            id: "1",
            name: "Website Redesign",
            progress: 75,
            status: "in-progress",
            dueDate: "2024-02-15",
            teamSize: 5,
          },
          {
            id: "2",
            name: "Mobile App Development",
            progress: 45,
            status: "in-progress",
            dueDate: "2024-03-20",
            teamSize: 8,
          },
          {
            id: "3",
            name: "Database Migration",
            progress: 90,
            status: "in-progress",
            dueDate: "2024-01-30",
            teamSize: 3,
          },
        ],
      },
    })
  }),

  // Generate custom report
  http.post("/api/reports/generate", async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: {
        reportId: "report_" + Date.now(),
        type: body.type,
        dateRange: body.dateRange,
        filters: body.filters,
        generatedAt: new Date().toISOString(),
        downloadUrl: "/api/reports/download/report_" + Date.now(),
      },
    })
  }),
]
