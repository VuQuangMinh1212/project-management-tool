import type { SocketEvents } from "@/types/socket"

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",

  // Task events
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_ASSIGNED: "task:assigned",
  TASK_STATUS_CHANGED: "task:status_changed",

  // Comment events
  COMMENT_ADDED: "comment:added",
  COMMENT_UPDATED: "comment:updated",
  COMMENT_DELETED: "comment:deleted",

  // Project events
  PROJECT_CREATED: "project:created",
  PROJECT_UPDATED: "project:updated",
  PROJECT_DELETED: "project:deleted",

  // User events
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_TYPING: "user:typing",
  USER_STOP_TYPING: "user:stop_typing",

  // Notification events
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",

  // Room events
  JOIN_ROOM: "join:room",
  LEAVE_ROOM: "leave:room",

  // Team events
  TEAM_MEMBER_ADDED: "team:member_added",
  TEAM_MEMBER_REMOVED: "team:member_removed",
} as const

export type SocketEventName = keyof SocketEvents

// Event payload types
export interface JoinRoomPayload {
  roomType: "project" | "task" | "user" | "team"
  roomId: string
}

export interface LeaveRoomPayload {
  roomType: "project" | "task" | "user" | "team"
  roomId: string
}

export interface TypingPayload {
  taskId: string
  userId: string
  userName: string
}

// Room naming utilities
export const getRoomName = (type: string, id: string): string => {
  return `${type}:${id}`
}

export const parseRoomName = (roomName: string): { type: string; id: string } => {
  const [type, id] = roomName.split(":")
  return { type, id }
}

// Event validation
export const isValidSocketEvent = (eventName: string): eventName is SocketEventName => {
  return Object.values(SOCKET_EVENTS).includes(eventName as any)
}
