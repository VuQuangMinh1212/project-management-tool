"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TaskModal } from "@/components/staff/TaskModal"
import { TaskCard } from "@/components/staff/TaskCard"
import type { Task } from "@/types/task"
import { getLegacyTasks } from "@/mock/data/legacy-compatibility"
import { ROUTES } from "@/constants/routes"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundTask = getLegacyTasks().find((t: Task) => t.id === params.id)
      setTask(foundTask || null)
      setIsLoading(false)
    }, 500)
  }, [params.id])

  const handleTaskUpdate = (updates: Partial<Task>) => {
    if (task) {
      setTask({ ...task, ...updates })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Task Not Found</h1>
          <p className="text-muted-foreground">The task you're looking for doesn't exist.</p>
          <Button onClick={() => router.push(ROUTES.STAFF.TASKS)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.STAFF.TASKS)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">Task Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Task Card */}
      <div className="max-w-md">
        <TaskCard task={task} />
      </div>

      {/* Edit Modal */}
      <TaskModal
        task={task}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(updates) => {
          handleTaskUpdate(updates)
          setIsEditModalOpen(false)
        }}
      />
    </div>
  )
}
