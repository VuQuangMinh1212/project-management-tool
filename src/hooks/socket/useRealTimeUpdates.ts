"use client"

import { useEffect } from "react"
import { useSocket } from "./useSocket"
import toast from "react-hot-toast"

interface TaskUpdateEvent {
  taskId: string
  updates: any
  updatedBy: {
    id: string
    name: string
  }
}

interface CommentAddedEvent {
  taskId: string
  comment: {
    id: string
    content: string
    author: {
      id: string
      name: string
    }
  }
}

interface UseRealTimeUpdatesProps {
  onTaskUpdate?: (event: TaskUpdateEvent) => void
  onCommentAdded?: (event: CommentAddedEvent) => void
  onNotification?: (notification: any) => void
}

export function useRealTimeUpdates({ onTaskUpdate, onCommentAdded, onNotification }: UseRealTimeUpdatesProps = {}) {
  const { on, off, isConnected } = useSocket()

  useEffect(() => {
    if (!isConnected) return

    // Task updates
    const handleTaskUpdate = (event: TaskUpdateEvent) => {
      onTaskUpdate?.(event)
      toast.success(`Task updated by ${event.updatedBy.name}`)
    }

    // Comment added
    const handleCommentAdded = (event: CommentAddedEvent) => {
      onCommentAdded?.(event)
      toast.success(`New comment from ${event.comment.author.name}`)
    }

    // General notifications
    const handleNotification = (notification: any) => {
      onNotification?.(notification)
      toast(notification.message, {
        icon: notification.type === "success" ? "✅" : "ℹ️",
      })
    }

    // Subscribe to events
    on("task:updated", handleTaskUpdate)
    on("comment:added", handleCommentAdded)
    on("notification", handleNotification)

    // Cleanup
    return () => {
      off("task:updated", handleTaskUpdate)
      off("comment:added", handleCommentAdded)
      off("notification", handleNotification)
    }
  }, [isConnected, on, off, onTaskUpdate, onCommentAdded, onNotification])

  return {
    isConnected,
  }
}
