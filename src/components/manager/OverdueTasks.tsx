"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Calendar, User, Clock, ChevronRight, ArrowLeft } from "lucide-react"
import type { Task } from "@/types/task"
import { TaskStatus, TaskPriority } from "@/types/task"
import { format, isPast, differenceInDays } from "date-fns"

interface OverdueTasksProps {
  tasks: Task[]
}

export function OverdueTasks({ tasks }: OverdueTasksProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.DONE
  )

  // Group overdue tasks by assignee
  const overdueByMember = overdueTasks.reduce((acc, task) => {
    const memberKey = task.assigneeName || "Unassigned"
    if (!acc[memberKey]) {
      acc[memberKey] = {
        memberName: task.assigneeName || "Unassigned",
        memberId: task.assigneeId || "unassigned",
        memberAvatar: task.assigneeAvatar,
        tasks: []
      }
    }
    acc[memberKey].tasks.push(task)
    return acc
  }, {} as Record<string, {
    memberName: string
    memberId: string
    memberAvatar?: string
    tasks: Task[]
  }>)

  const memberSummaries = Object.values(overdueByMember).sort((a, b) => b.tasks.length - a.tasks.length)

  const selectedMemberData = selectedMember ? overdueByMember[selectedMember] : null
  const selectedMemberTasks = selectedMemberData?.tasks.sort((a, b) => {
    // Sort by how many days overdue (most overdue first)
    const aDays = Math.abs(differenceInDays(new Date(), new Date(a.dueDate!)))
    const bDays = Math.abs(differenceInDays(new Date(), new Date(b.dueDate!)))
    return bDays - aDays
  }) || []

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800"
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (overdueTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Clock className="h-5 w-5" />
            Nhiệm vụ Quá hạn
          </CardTitle>
          <CardDescription>Tasks that are past their due date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8" />
            </div>
            <p className="font-medium">Tuyệt vời! Không có nhiệm vụ quá hạn</p>
            <p className="text-sm text-muted-foreground mt-1">All tasks are on track</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedMember && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMember(null)}
                className="text-red-700 hover:text-red-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                {selectedMember 
                  ? `Nhiệm vụ Quá hạn của ${selectedMemberData?.memberName}`
                  : `Nhiệm vụ Quá hạn (${overdueTasks.length})`
                }
              </CardTitle>
              <CardDescription className="text-red-600">
                {selectedMember
                  ? `${selectedMemberTasks.length} task${selectedMemberTasks.length > 1 ? 's' : ''} need attention`
                  : "Thành viên nhóm có nhiệm vụ quá hạn"
                }
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {!selectedMember ? (
          // Summary view showing members with overdue task counts
          <>
            {memberSummaries.map((member) => (
              <div
                key={member.memberId}
                onClick={() => setSelectedMember(member.memberName)}
                className="p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.memberAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-red-200 text-red-700">
                        {member.memberName === "Unassigned" 
                          ? "?" 
                          : member.memberName.split(" ").map(n => n[0]).join("")
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-red-800">{member.memberName}</p>
                      <p className="text-sm text-red-600">
                        {member.tasks.length} nhiệm vụ quá hạn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="bg-red-600">
                      {member.tasks.length}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-red-600 group-hover:text-red-700" />
                  </div>
                </div>
                
                {/* Show most overdue task as preview */}
                <div className="mt-3 pl-13">
                  <div className="text-xs text-red-700">
                    Quá hạn nhất: <span className="font-medium">{member.tasks[0]?.title}</span>
                    {member.tasks[0]?.dueDate && (
                      <span className="ml-2">
                        ({Math.abs(differenceInDays(new Date(), new Date(member.tasks[0].dueDate)))} days)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Detailed view showing individual tasks for selected member
          <>
            {selectedMemberTasks.map((task) => {
              const daysOverdue = Math.abs(differenceInDays(new Date(), new Date(task.dueDate!)))
              
              return (
                <div
                  key={task.id}
                  className="p-4 border border-red-200 bg-red-50 rounded-lg space-y-3"
                >
                  {/* Header with title and priority */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
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
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      {task.project?.name && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{task.project.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-red-700 font-medium">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {format(new Date(task.dueDate!), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  {/* Overdue badge */}
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 text-xs text-red-800 bg-red-200 px-3 py-1 rounded-full font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        Quá hạn {daysOverdue} ngày
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </CardContent>
    </Card>
  )
}
