import type { Socket } from "socket.io-client"
import type { SocketEvents } from "@/types/socket"
import { SOCKET_EVENTS } from "./events"

export class SocketEventHandlers {
  private socket: Socket
  private handlers: Map<string, Function[]> = new Map()

  constructor(socket: Socket) {
    this.socket = socket
    this.setupDefaultHandlers()
  }

  private setupDefaultHandlers() {
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id)
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  }

  // Generic event handler registration
  on<K extends keyof SocketEvents>(event: K, handler: (data: SocketEvents[K]) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, [])
      this.socket.on(event, (data) => {
        const eventHandlers = this.handlers.get(event) || []
        eventHandlers.forEach((h) => h(data))
      })
    }

    const eventHandlers = this.handlers.get(event) || []
    eventHandlers.push(handler)
    this.handlers.set(event, eventHandlers)
  }

  // Remove event handler
  off<K extends keyof SocketEvents>(event: K, handler?: (data: SocketEvents[K]) => void): void {
    if (!handler) {
      // Remove all handlers for this event
      this.handlers.delete(event)
      this.socket.off(event)
      return
    }

    const eventHandlers = this.handlers.get(event) || []
    const filteredHandlers = eventHandlers.filter((h) => h !== handler)

    if (filteredHandlers.length === 0) {
      this.handlers.delete(event)
      this.socket.off(event)
    } else {
      this.handlers.set(event, filteredHandlers)
    }
  }

  // Emit events
  emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]): void {
    this.socket.emit(event, data)
  }

  // Join room
  joinRoom(roomType: string, roomId: string): void {
    this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomType, roomId })
  }

  // Leave room
  leaveRoom(roomType: string, roomId: string): void {
    this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomType, roomId })
  }

  // Task-specific handlers
  onTaskCreated(handler: (data: SocketEvents["task:created"]) => void): void {
    this.on("task:created", handler)
  }

  onTaskUpdated(handler: (data: SocketEvents["task:updated"]) => void): void {
    this.on("task:updated", handler)
  }

  onTaskDeleted(handler: (data: SocketEvents["task:deleted"]) => void): void {
    this.on("task:deleted", handler)
  }

  onTaskAssigned(handler: (data: SocketEvents["task:assigned"]) => void): void {
    this.on("task:assigned", handler)
  }

  // Comment-specific handlers
  onCommentAdded(handler: (data: SocketEvents["comment:added"]) => void): void {
    this.on("comment:added", handler)
  }

  onCommentUpdated(handler: (data: SocketEvents["comment:updated"]) => void): void {
    this.on("comment:updated", handler)
  }

  onCommentDeleted(handler: (data: SocketEvents["comment:deleted"]) => void): void {
    this.on("comment:deleted", handler)
  }

  // User presence handlers
  onUserOnline(handler: (data: SocketEvents["user:online"]) => void): void {
    this.on("user:online", handler)
  }

  onUserOffline(handler: (data: SocketEvents["user:offline"]) => void): void {
    this.on("user:offline", handler)
  }

  // Notification handlers
  onNotification(handler: (data: SocketEvents["notification:new"]) => void): void {
    this.on("notification:new", handler)
  }

  // Cleanup all handlers
  cleanup(): void {
    this.handlers.clear()
    this.socket.removeAllListeners()
  }

  // Get connection status
  get connected(): boolean {
    return this.socket.connected
  }

  // Get socket ID
  get id(): string | undefined {
    return this.socket.id
  }
}
