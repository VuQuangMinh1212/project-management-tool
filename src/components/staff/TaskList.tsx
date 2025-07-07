"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MoreHorizontal, Calendar, Flag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Task } from "@/types/task"
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/constants/taskStatus"
import { StatusBadge } from "./StatusBadge"

interface TaskListProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
}

export function TaskList({ tasks, onTaskClick, onTaskEdit, onTaskDelete }: TaskListProps) {
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "status" | "title">("dueDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any = a[sortBy]
    let bValue: any = b[sortBy]

    if (sortBy === "dueDate") {
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
    }

    if (sortBy === "priority") {
      const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
      aValue = priorityOrder[a.priority]
      bValue = priorityOrder[b.priority]
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("title")}>
              Task
            </TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
              Status
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("priority")}>
              Priority
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("dueDate")}>
              Due Date
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onTaskClick?.(task)}>
              <TableCell>
                <div>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assigneeAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {task.assigneeName
                        ? task.assigneeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assigneeName}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell>
                <Badge className={TASK_PRIORITY_COLORS[task.priority]}>
                  <Flag className="mr-1 h-3 w-3" />
                  {TASK_PRIORITY_LABELS[task.priority]}
                </Badge>
              </TableCell>
              <TableCell>
                {task.dueDate ? (
                  <div className="flex items-center space-x-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No due date</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskClick?.(task)
                      }}
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskEdit?.(task)
                      }}
                    >
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskDelete?.(task.id)
                      }}
                    >
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {sortedTasks.length === 0 && <div className="text-center py-8 text-muted-foreground">No tasks found</div>}
    </div>
  )
}
