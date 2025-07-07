"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tasksService } from "@/services/api/tasks"
import type { CreateTaskData, UpdateTaskData } from "@/types/task"
import toast from "react-hot-toast"

export function useTasks(filters?: {
  status?: string
  assigneeId?: string
  projectId?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksService.getTasks(filters),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksService.getTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskData) => tasksService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create task")
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) => tasksService.updateTask(id, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.setQueryData(["task", updatedTask.id], updatedTask)
      toast.success("Task updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update task")
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete task")
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) => tasksService.addComment(taskId, content),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      toast.success("Comment added successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add comment")
    },
  })
}
