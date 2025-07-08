// Task status matching database schema
export enum TaskStatus {
  DRAFT = "draft", // Staff can create multiple draft tasks
  PENDING_APPROVAL = "pending_approval", // Submitted for manager approval
  APPROVED = "approved", // Manager approved, can start working
  TODO = "todo", // Approved and ready to start
  IN_PROGRESS = "in_progress",
  DONE = "done",
  FINISHED = "finished", // Staff completed the task
  DELAYED = "delayed", // Staff reported delay
  CANCELLED = "cancelled", // Staff cancelled the task
  REJECTED = "rejected", // Manager rejected with comments
  OVERDUE = "overdue", // Task is past its due date
}

// User roles matching database schema
export enum UserRole {
  EMPLOYEE = "employee",
  MANAGER = "manager",
}

// Plan status matching database schema
export enum PlanStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Labels for UI display
export const TASK_STATUS_LABELS = {
  [TaskStatus.DRAFT]: "Bản Nháp",
  [TaskStatus.PENDING_APPROVAL]: "Chờ Phê Duyệt",
  [TaskStatus.APPROVED]: "Đã Phê Duyệt",
  [TaskStatus.TODO]: "Cần Làm",
  [TaskStatus.IN_PROGRESS]: "Đang Thực Hiện",
  [TaskStatus.DONE]: "Hoàn Thành",
  [TaskStatus.FINISHED]: "Đã Kết Thúc",
  [TaskStatus.DELAYED]: "Bị Trễ",
  [TaskStatus.CANCELLED]: "Đã Hủy",
  [TaskStatus.REJECTED]: "Bị Từ Chối",
  [TaskStatus.OVERDUE]: "Quá Hạn",
} as const;

export const USER_ROLE_LABELS = {
  [UserRole.EMPLOYEE]: "Employee",
  [UserRole.MANAGER]: "Manager",
} as const;

export const PLAN_STATUS_LABELS = {
  [PlanStatus.PENDING]: "Pending",
  [PlanStatus.APPROVED]: "Approved",
  [PlanStatus.REJECTED]: "Rejected",
} as const;

// Colors for UI components
export const TASK_STATUS_COLORS = {
  [TaskStatus.DRAFT]: "bg-gray-100 text-gray-600",
  [TaskStatus.PENDING_APPROVAL]: "bg-yellow-100 text-yellow-800",
  [TaskStatus.APPROVED]: "bg-green-100 text-green-700",
  [TaskStatus.TODO]: "bg-blue-100 text-blue-800",
  [TaskStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800",
  [TaskStatus.DONE]: "bg-green-100 text-green-800",
  [TaskStatus.FINISHED]: "bg-green-100 text-green-800",
  [TaskStatus.DELAYED]: "bg-orange-100 text-orange-800",
  [TaskStatus.CANCELLED]: "bg-red-100 text-red-800",
  [TaskStatus.REJECTED]: "bg-red-100 text-red-800",
  [TaskStatus.OVERDUE]: "bg-red-200 text-red-900",
} as const;

export const PLAN_STATUS_COLORS = {
  [PlanStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [PlanStatus.APPROVED]: "bg-green-100 text-green-800",
  [PlanStatus.REJECTED]: "bg-red-100 text-red-800",
} as const;

// Legacy priority support (will be removed in future)
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export const TASK_PRIORITY_LABELS = {
  [TaskPriority.LOW]: "Thấp",
  [TaskPriority.MEDIUM]: "Trung Bình",
  [TaskPriority.HIGH]: "Cao",
  [TaskPriority.URGENT]: "Khẩn Cấp",
} as const;

export const TASK_PRIORITY_COLORS = {
  [TaskPriority.LOW]: "bg-gray-100 text-gray-800",
  [TaskPriority.MEDIUM]: "bg-blue-100 text-blue-800",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TaskPriority.URGENT]: "bg-red-100 text-red-800",
} as const;
