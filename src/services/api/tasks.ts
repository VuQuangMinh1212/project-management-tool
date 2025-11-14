import { apiClient } from "@/lib/api/client";
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskComment,
} from "@/types/task";

export const tasksService = {
  async getTasks(params?: {
    status?: string;
    assigneeId?: string;
    projectId?: string;
    priority?: string;
    search?: string;
    isDraft?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.assigneeId) queryParams.append("assigneeId", params.assigneeId);
    if (params?.projectId) queryParams.append("projectId", params.projectId);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.weekSubmittedFor)
      queryParams.append("weekSubmittedFor", params.weekSubmittedFor);
    if (params?.isDraft !== undefined)
      queryParams.append("isDraft", params.isDraft.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/tasks?${queryString}` : "/tasks";
    return apiClient.get<Task[]>(url);
  },

  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    return apiClient.post<Task>("/tasks", data);
  },

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, data);
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete(`/tasks/${id}`);
  },

  async getMyTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>("/tasks/my-tasks");
  },

  async getDraftTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>("/tasks/drafts");
  },

  async getPendingApprovals(): Promise<Task[]> {
    return apiClient.get<Task[]>("/tasks/pending-approvals");
  },

  async getOverdueTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>("/tasks/overdue");
  },

  async getTaskStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  }> {
    return apiClient.get("/tasks/stats");
  },

  async getTasksByWeek(week: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/tasks/week/${week}`);
  },

  async addComment(taskId: string, content: string): Promise<TaskComment> {
    return apiClient.post(`/tasks/${taskId}/comments`, { content });
  },

  async updateComment(
    taskId: string,
    commentId: string,
    content: string
  ): Promise<TaskComment> {
    return apiClient.patch(`/tasks/${taskId}/comments/${commentId}`, {
      content,
    });
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  async uploadTaskImages(taskId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    return apiClient.post(`/task-images/${taskId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async updateTaskImages(taskId: string, data: { imagesToDelete?: string[], newImages?: File[] }): Promise<void> {
    const formData = new FormData();
    if (data.imagesToDelete) {
      formData.append("imagesToDelete", JSON.stringify(data.imagesToDelete));
    }
    if (data.newImages) {
      data.newImages.forEach(file => formData.append("newImages", file));
    }
    return apiClient.put(`/task-images/${taskId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async getTaskImages(taskId: string): Promise<any[]> {
    return apiClient.get(`/task-images/task/${taskId}`);
  },

  async deleteTaskImage(imageId: string): Promise<void> {
    return apiClient.delete(`/task-images/${imageId}`);
  },

  async getTasksByProject(
    projectId: string,
    params?: {
      status?: string;
      assigneeId?: string;
      priority?: string;
      search?: string;
      isDraft?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.assigneeId) queryParams.append("assigneeId", params.assigneeId);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.weekSubmittedFor)
      queryParams.append("weekSubmittedFor", params.weekSubmittedFor);
    if (params?.isDraft !== undefined)
      queryParams.append("isDraft", params.isDraft.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/tasks/project/${projectId}?${queryString}`
      : `/tasks/project/${projectId}`;
    return apiClient.get<Task[]>(url);
  },

  async getTasksByUser(
    userId: string,
    params?: {
      status?: string;
      priority?: string;
      search?: string;
      isDraft?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.weekSubmittedFor)
      queryParams.append("weekSubmittedFor", params.weekSubmittedFor);
    if (params?.isDraft !== undefined)
      queryParams.append("isDraft", params.isDraft.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/tasks/user/${userId}?${queryString}`
      : `/tasks/user/${userId}`;
    return apiClient.get<Task[]>(url);
  },

  async createTasksBulk(data: { tasks: CreateTaskData[] }): Promise<Task[]> {
    return apiClient.post<Task[]>("/tasks/bulk", data);
  },

  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/tasks/${parentTaskId}/subtasks`);
  },

  async approveTask(taskId: string, reviewComment?: string): Promise<Task> {
    return apiClient.post<Task>(`/tasks/${taskId}/approve`, { reviewComment });
  },

  async rejectTask(taskId: string, reviewComment: string): Promise<Task> {
    return apiClient.post<Task>(`/tasks/${taskId}/reject`, { reviewComment });
  },

  async submitTasksForApproval(taskIds: string[]): Promise<void> {
    return apiClient.post('/tasks/submit-for-approval', { taskIds });
  },
};
