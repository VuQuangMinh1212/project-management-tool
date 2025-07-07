"use client"

import { io, type Socket } from "socket.io-client"
import { tokenStorage } from "@/lib/auth/token"

class SocketService {
  private socket: Socket | null = null
  private url: string

  constructor() {
    this.url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
  }

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const token = tokenStorage.getToken()

    this.socket = io(this.url, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    })

    this.socket.on("connect", () => {
      console.log("Connected to socket server")
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const socketService = new SocketService()
