import { TaskStatus, TaskPriority } from "@/constants/taskStatus";

export { TaskStatus, TaskPriority };

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  projectId?: string;
  projectName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  estimatedHours?: number;
  actualHours?: number;

  // New workflow fields
  weekSubmittedFor?: string; // ISO week format (e.g., "2025-W01")
  submittedAt?: string; // When submitted for approval
  reviewedAt?: string; // When manager reviewed
  reviewedById?: string; // Manager who reviewed
  reviewComment?: string; // Manager's approval/rejection comment
  isDraft?: boolean; // Whether task is still in draft state
  batchId?: string; // Group tasks submitted together
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
  priority: TaskPriority;
  assigneeId: string;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  weekSubmittedFor?: string; // Target week for the task
  isDraft?: boolean; // Whether to save as draft
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  reviewComment?: string; // Manager's review comment
  statusNote?: string; // Staff notes when updating status
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
