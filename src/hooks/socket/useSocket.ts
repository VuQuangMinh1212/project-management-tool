"use client"

import { useEffect, useRef } from "react"
import { socketService } from "@/services/socket/socket"
import { useAuth } from "@/hooks/auth/useAuth"

export function useSocket() {
  const { isAuthenticated } = useAuth()
  const socketRef = useRef(socketService.getSocket())

  useEffect(() => {
    if (isAuthenticated && !socketRef.current?.connected) {
      socketRef.current = socketService.connect()
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect()
      }
    }
  }, [isAuthenticated])

  const emit = (event: string, data: any) => {
    socketService.emit(event, data)
  }

  const on = (event: string, callback: (data: any) => void) => {
    socketService.on(event, callback)
  }

  const off = (event: string, callback?: (data: any) => void) => {
    socketService.off(event, callback)
  }

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected || false,
  }
}
