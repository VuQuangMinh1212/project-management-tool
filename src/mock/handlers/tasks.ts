import { http, HttpResponse } from "msw";
import type { Task, CreateTaskData, UpdateTaskData } from "@/types/task";
import { getLegacyTasks } from "@/mock/data/legacy-compatibility";

// Create a mutable copy of mock tasks
const tasks: Task[] = [...getLegacyTasks()];

export const taskHandlers = [
  // Get all tasks
  http.get("/api/tasks", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const assignedTo = url.searchParams.get("assignedTo");
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    let filteredTasks = [...tasks];

    // Apply filters
    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priority
      );
    }

    if (assignedTo) {
      filteredTasks = filteredTasks.filter(
        (task) => task.assigneeId === assignedTo
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          HttpResponse.json({
            tasks: paginatedTasks,
            pagination: {
              page,
              limit,
              total: filteredTasks.length,
              totalPages: Math.ceil(filteredTasks.length / limit),
            },
          })
        );
      }, 800);
    });
  }),

  // Get single task
  http.get("/api/tasks/:id", ({ params }) => {
    const { id } = params;
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json({ task }));
      }, 500);
    });
  }),

  // Create new task
  http.post("/api/tasks", async ({ request }) => {
    const taskData = (await request.json()) as CreateTaskData;

    // Simulate validation
    if (!taskData.title || !taskData.description) {
      return HttpResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const newTask: Task = {
      id: String(tasks.length + 1),
      title: taskData.title,
      description: taskData.description,
      status: "todo" as any, // Default status
      priority: taskData.priority || ("medium" as any),
      assigneeId: taskData.assigneeId || "",
      assigneeName: "Unknown User", // Will be populated based on assigneeId
      projectId: taskData.projectId || "",
      dueDate: taskData.dueDate || "",
      tags: taskData.tags || [],
      attachments: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json({ task: newTask }, { status: 201 }));
      }, 1000);
    });
  }),

  // Update task
  http.put("/api/tasks/:id", async ({ params, request }) => {
    const { id } = params;
    const updateData = (await request.json()) as UpdateTaskData;

    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update task
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json({ task: tasks[taskIndex] }));
      }, 800);
    });
  }),

  // Delete task
  http.delete("/api/tasks/:id", ({ params }) => {
    const { id } = params;
    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks.splice(taskIndex, 1);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json({ message: "Task deleted successfully" }));
      }, 600);
    });
  }),

  // Get task statistics
  http.get("/api/tasks/stats", () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "done").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      todo: tasks.filter((t) => t.status === "todo").length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date()
      ).length,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json({ stats }));
      }, 400);
    });
  }),
];
