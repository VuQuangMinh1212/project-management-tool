import { TaskStatus, TaskPriority } from "@/constants/taskStatus";

export { TaskStatus, TaskPriority };

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  dueDate?: string;
  estimatedHours?: number;
  weekSubmittedFor?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    fullName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  tags?: string[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  actualHours?: number;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedById?: string;
  reviewComment?: string;
  statusNote?: string;
  isDraft?: boolean;
  batchId?: string;
  parentTaskId?: string;
  subtasks?: Task[];
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigneeIds: string[];
  projectId: string;
  priority: string;
  dueDate?: string;
  estimatedHours?: number;
  weekSubmittedFor?: string;
  isDraft?: boolean;
  parentTaskId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assigneeIds?: string[];
  projectId?: string;
  priority?: string;
  dueDate?: string;
  estimatedHours?: number;
  weekSubmittedFor?: string;
  isDraft?: boolean;
  parentTaskId?: string;
  status?: string;
  reviewComment?: string;
  statusNote?: string;
  actualHours?: number;
}

// New interfaces for batch operations
export interface TaskBatch {
  id: string;
  staffId: string;
  staffName: string;
  weekSubmittedFor: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "partial";
  taskIds: string[];
  totalTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
}

export interface BatchApprovalData {
  batchId: string;
  approvals: {
    taskId: string;
    status: "in_progress" | "rejected"; // Changed from "approved" to "in_progress"
    comment?: string;
  }[];
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string[];
  projectId?: string[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
