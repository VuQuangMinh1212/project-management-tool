import type { Task, Project } from "./task" // Assuming Task and Project are declared in another file

export interface SocketEvents {
  // Task events
  "task:created": TaskCreatedEvent
  "task:updated": TaskUpdatedEvent
  "task:deleted": TaskDeletedEvent
  "task:assigned": TaskAssignedEvent

  // Comment events
  "comment:added": CommentAddedEvent
  "comment:updated": CommentUpdatedEvent
  "comment:deleted": CommentDeletedEvent

  // Project events
  "project:created": ProjectCreatedEvent
  "project:updated": ProjectUpdatedEvent

  // User events
  "user:online": UserOnlineEvent
  "user:offline": UserOfflineEvent

  // Notification events
  "notification:new": NotificationEvent

  // General events
  error: ErrorEvent
  disconnect: DisconnectEvent
}

export interface TaskCreatedEvent {
  task: Task
  createdBy: {
    id: string
    name: string
  }
}

export interface TaskUpdatedEvent {
  taskId: string
  updates: Partial<Task>
  updatedBy: {
    id: string
    name: string
  }
  previousValues?: Partial<Task>
}

export interface TaskDeletedEvent {
  taskId: string
  deletedBy: {
    id: string
    name: string
  }
}

export interface TaskAssignedEvent {
  taskId: string
  assigneeId: string
  assignedBy: {
    id: string
    name: string
  }
}

export interface CommentAddedEvent {
  taskId: string
  comment: {
    id: string
    content: string
    author: {
      id: string
      name: string
    }
    createdAt: string
  }
}

export interface CommentUpdatedEvent {
  taskId: string
  commentId: string
  content: string
  updatedBy: {
    id: string
    name: string
  }
}

export interface CommentDeletedEvent {
  taskId: string
  commentId: string
  deletedBy: {
    id: string
    name: string
  }
}

export interface ProjectCreatedEvent {
  project: Project
  createdBy: {
    id: string
    name: string
  }
}

export interface ProjectUpdatedEvent {
  projectId: string
  updates: Partial<Project>
  updatedBy: {
    id: string
    name: string
  }
}

export interface UserOnlineEvent {
  userId: string
  userName: string
  timestamp: string
}

export interface UserOfflineEvent {
  userId: string
  userName: string
  timestamp: string
}

export interface NotificationEvent {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  userId: string
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface ErrorEvent {
  message: string
  code?: string
  details?: any
}

export interface DisconnectEvent {
  reason: string
  timestamp: string
}

// Socket connection states
export enum SocketConnectionState {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

// Socket room types
export enum SocketRoom {
  USER = "user",
  PROJECT = "project",
  TASK = "task",
  TEAM = "team",
}
