export enum TaskStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  DONE = 'done',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
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

export const TASK_STATUS_LABELS = {
  [TaskStatus.DRAFT]: "Bản Nháp",
  [TaskStatus.PENDING_APPROVAL]: "Chờ Phê Duyệt",
  [TaskStatus.REJECTED]: "Bị Từ Chối",
  [TaskStatus.TODO]: "Cần Làm",
  [TaskStatus.IN_PROGRESS]: "Đang Thực Hiện",
  [TaskStatus.FINISHED]: "Đã Kết Thúc",
  [TaskStatus.DONE]: "Hoàn Thành",
  [TaskStatus.DELAYED]: "Bị Trễ",
  [TaskStatus.CANCELLED]: "Đã Hủy",
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

export const TASK_STATUS_COLORS = {
  [TaskStatus.DRAFT]: "bg-gray-100 text-gray-600",
  [TaskStatus.PENDING_APPROVAL]: "bg-yellow-100 text-yellow-800",
  [TaskStatus.REJECTED]: "bg-red-100 text-red-800",
  [TaskStatus.TODO]: "bg-blue-100 text-blue-800",
  [TaskStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800",
  [TaskStatus.FINISHED]: "bg-green-100 text-green-800",
  [TaskStatus.DONE]: "bg-green-100 text-green-800",
  [TaskStatus.DELAYED]: "bg-orange-100 text-orange-800",
  [TaskStatus.CANCELLED]: "bg-red-100 text-red-800",
  [TaskStatus.OVERDUE]: "bg-red-200 text-red-900",
} as const;

export const PLAN_STATUS_COLORS = {
  [PlanStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [PlanStatus.APPROVED]: "bg-green-100 text-green-800",
  [PlanStatus.REJECTED]: "bg-red-100 text-red-800",
} as const;

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
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
