import { io, type Socket } from "socket.io-client"
import { tokenStorage } from "@/lib/auth/token"
import { authStorage } from "@/lib/auth/storage"

/**
 * Socket connection configuration
 */
interface SocketConfig {
  url: string
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
  timeout?: number
}

/**
 * Socket connection events
 */
export interface SocketEvents {
  // Connection events
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  reconnect: (attemptNumber: number) => void
  reconnect_attempt: (attemptNumber: number) => void
  reconnect_error: (error: Error) => void
  reconnect_failed: () => void

  // Authentication events
  authenticated: (data: { userId: string }) => void
  unauthorized: (error: { message: string }) => void

  // Task events
  task_created: (task: any) => void
  task_updated: (task: any) => void
  task_deleted: (taskId: string) => void
  task_assigned: (data: { taskId: string; assignedTo: string }) => void
  task_status_changed: (data: { taskId: string; status: string }) => void

  // Project events
  project_created: (project: any) => void
  project_updated: (project: any) => void
  project_deleted: (projectId: string) => void

  // User events
  user_online: (userId: string) => void
  user_offline: (userId: string) => void
  user_typing: (data: { userId: string; taskId?: string }) => void

  // Notification events
  notification: (notification: any) => void
  notification_read: (notificationId: string) => void

  // Real-time updates
  live_update: (data: { type: string; payload: any }) => void
}

/**
 * Socket connection manager
 */
export class SocketConnection {
  private static instance: SocketConnection
  private socket: Socket | null = null
  private config: SocketConfig
  private isConnecting = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private eventListeners = new Map<string, Function[]>()

  constructor(config: SocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      ...config,
    }
  }

  static getInstance(config?: SocketConfig): SocketConnection {
    if (!SocketConnection.instance && config) {
      SocketConnection.instance = new SocketConnection(config)
    }
    return SocketConnection.instance
  }

  /**
   * Initialize socket connection
   */
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      const token = tokenStorage.getToken()
      const user = authStorage.getUser()

      if (!token || !user) {
        throw new Error("No authentication token or user found")
      }

      // Create socket connection
      this.socket = io(this.config.url, {
        auth: {
          token,
          userId: user.id,
        },
        autoConnect: this.config.autoConnect,
        reconnection: this.config.reconnection,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        timeout: this.config.timeout,
        transports: ["websocket", "polling"],
      })

      this.setupEventListeners()
      this.startHeartbeat()

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"))
        }, this.config.timeout)

        this.socket!.on("connect", () => {
          clearTimeout(timeout)
          this.isConnecting = false
          resolve()
        })

        this.socket!.on("connect_error", (error) => {
          clearTimeout(timeout)
          this.isConnecting = false
          reject(error)
        })
      })
    } catch (error) {
      this.isConnecting = false
      console.error("Socket connection failed:", error)
      throw error
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.stopHeartbeat()
    this.clearReconnectTimer()
    this.isConnecting = false
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn(`Cannot emit ${event}: Socket not connected`)
      return
    }

    this.socket.emit(event, data)
  }

  /**
   * Listen to socket events
   */
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }

    this.eventListeners.get(event)!.push(callback)

    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  /**
   * Remove event listener
   */
  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (callback) {
      const listeners = this.eventListeners.get(event) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(event)
    }

    if (this.socket) {
      this.socket.off(event, callback as any)
    }
  }

  /**
   * Listen to event once
   */
  once<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (this.socket) {
      this.socket.once(event, callback as any)
    }
  }

  /**
   * Setup default event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected")
      this.isConnecting = false
      this.clearReconnectTimer()
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)

      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.scheduleReconnect()
      }
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.isConnecting = false
      this.scheduleReconnect()
    })

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`)
    })

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`)
    })

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error)
    })

    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed")
    })

    // Authentication events
    this.socket.on("authenticated", (data) => {
      console.log("Socket authenticated for user:", data.userId)
    })

    this.socket.on("unauthorized", (error) => {
      console.error("Socket unauthorized:", error.message)
      // Clear auth data and redirect to login
      authStorage.clearSession()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    })

    // Re-register custom event listeners
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket!.on(event, callback as any)
      })
    })
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.isConnected()) {
        console.log("Attempting to reconnect socket...")
        this.connect().catch(console.error)
      }
    }, this.config.reconnectionDelay)
  }

  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("ping")
      }
    }, 30000) // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Join a room (for task/project-specific updates)
   */
  joinRoom(room: string): void {
    this.emit("join_room", { room })
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    this.emit("leave_room", { room })
  }

  /**
   * Send typing indicator
   */
  sendTyping(taskId?: string): void {
    this.emit("typing", { taskId })
  }

  /**
   * Stop typing indicator
   */
  stopTyping(taskId?: string): void {
    this.emit("stop_typing", { taskId })
  }

  /**
   * Update user status
   */
  updateStatus(status: "online" | "away" | "busy" | "offline"): void {
    this.emit("status_update", { status })
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      transport: this.socket?.io.engine.transport.name,
      id: this.socket?.id,
      listeners: this.eventListeners.size,
    }
  }
}

/**
 * Create and export socket connection instance
 */
export function createSocketConnection(config: SocketConfig): SocketConnection {
  return SocketConnection.getInstance(config)
}

/**
 * Get existing socket connection instance
 */
export function getSocketConnection(): SocketConnection | null {
  try {
    return SocketConnection.getInstance()
  } catch {
    return null
  }
}
