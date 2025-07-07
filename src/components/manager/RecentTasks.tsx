"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, AlertTriangle, Calendar, User } from "lucide-react"
import type { Task } from "@/types/task"
import { TaskStatus, TaskPriority } from "@/types/task"
import { format, isToday, isPast, differenceInDays } from "date-fns"

interface RecentTasksProps {
  tasks: Task[]
  initialDisplayCount?: number
  staffName?: string
}

export function RecentTasks({ tasks, initialDisplayCount = 3, staffName }: RecentTasksProps) {
  const [showAll, setShowAll] = useState(false)

  // Sort tasks by creation date (most recent first) and due date priority
  const sortedTasks = [...tasks].sort((a, b) => {
    // First prioritize overdue tasks
    const aOverdue = a.dueDate && isPast(new Date(a.dueDate)) && a.status !== TaskStatus.DONE
    const bOverdue = b.dueDate && isPast(new Date(b.dueDate)) && b.status !== TaskStatus.DONE
    
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    
    // Then sort by creation date (most recent first)
    const aDate = new Date(a.createdAt || a.dueDate || 0)
    const bDate = new Date(b.createdAt || b.dueDate || 0)
    return bDate.getTime() - aDate.getTime()
  })

  const displayedTasks = showAll ? sortedTasks : sortedTasks.slice(0, initialDisplayCount)
  const remainingCount = sortedTasks.length - initialDisplayCount

  const isOverdue = (task: Task) => {
    return task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.DONE
  }

  const isDueSoon = (task: Task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const daysDiff = differenceInDays(dueDate, new Date())
    return daysDiff >= 0 && daysDiff <= 2 && task.status !== TaskStatus.DONE
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.DONE:
        return "bg-green-100 text-green-800"
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800"
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-500"
      case TaskPriority.HIGH:
        return "bg-orange-500"
      case TaskPriority.MEDIUM:
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {staffName ? `${staffName}'s Recent Tasks` : "Recent Tasks"}
        </CardTitle>
        <CardDescription>
          {staffName 
            ? `Latest tasks assigned to ${staffName} with overdue and upcoming deadlines highlighted`
            : "Latest tasks with overdue and upcoming deadlines highlighted"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks found</p>
          </div>
        ) : (
          <>
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg space-y-3 transition-colors ${
                  isOverdue(task) 
                    ? "border-red-200 bg-red-50" 
                    : isDueSoon(task)
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Header with title and priority */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate flex items-center gap-2">
                      {isOverdue(task) && (
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} title={`${task.priority} priority`} />
                    <Badge variant="secondary" className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Task details */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {task.assigneeName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.assigneeName}</span>
                      </div>
                    )}
                    {task.project?.name && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>{task.project.name}</span>
                      </div>
                    )}
                  </div>
                  
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 ${
                      isOverdue(task) 
                        ? "text-red-600 font-medium"
                        : isDueSoon(task)
                        ? "text-yellow-600 font-medium"
                        : ""
                    }`}>
                      <Calendar className="h-3 w-3" />
                      <span>
                        {isOverdue(task) && "Overdue: "}
                        {isDueSoon(task) && !isOverdue(task) && "Due: "}
                        {isToday(new Date(task.dueDate)) 
                          ? "Today" 
                          : format(new Date(task.dueDate), "MMM d")
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Overdue warning */}
                {isOverdue(task) && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    <span>
                      Overdue by {Math.abs(differenceInDays(new Date(), new Date(task.dueDate!)))} day(s)
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Show more button */}
            {!showAll && remainingCount > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowAll(true)}
                className="w-full mt-4"
              >
                Show {remainingCount} more task{remainingCount > 1 ? "s" : ""}
              </Button>
            )}

            {/* Show less button */}
            {showAll && sortedTasks.length > initialDisplayCount && (
              <Button
                variant="outline"
                onClick={() => setShowAll(false)}
                className="w-full mt-4"
              >
                Show less
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
