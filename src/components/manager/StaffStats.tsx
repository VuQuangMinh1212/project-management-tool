"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Task } from "@/types/task"
import { TaskStatus, TaskPriority } from "@/types/task"
import type { TeamMember } from "@/types/user"

interface StaffStatsProps {
  staffMember: TeamMember
  tasks: Task[]
}

export function StaffStats({ staffMember, tasks }: StaffStatsProps) {
  // Filter tasks for this specific staff member
  const staffTasks = tasks.filter((task) => task.assigneeId === staffMember.id)
  
  const totalTasks = staffTasks.length
  const completedTasks = staffTasks.filter((task) => task.status === "done").length
  const inProgressTasks = staffTasks.filter((task) => task.status === "in_progress").length
  const todoTasks = staffTasks.filter((task) => task.status === "todo").length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const overdueTasks = staffTasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống Kê Nhân Viên: {staffMember.name}</CardTitle>
        <CardDescription>Chỉ số hiệu suất của {staffMember.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hoàn Thành Tổng Thể</span>
            <span className="text-sm text-muted-foreground">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Task Status Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Trạng Thái Nhiệm Vụ</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Hoàn thành</span>
                <span className="text-xs font-medium">{completedTasks}</span>
              </div>
              <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="h-1" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Đang thực hiện</span>
                <span className="text-xs font-medium">{inProgressTasks}</span>
              </div>
              <Progress value={totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0} className="h-1" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cần Làm</span>
                <span className="text-xs font-medium">{todoTasks}</span>
              </div>
              <Progress value={totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0} className="h-1" />
            </div>
          </div>
        </div>

        {/* Productivity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Năng Suất</h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tỷ Lệ Năng Suất</span>
            <span className="font-medium">{staffMember.stats.productivity}%</span>
          </div>
          <Progress value={staffMember.stats.productivity} className="h-2" />
        </div>

        {/* Alerts */}
        {overdueTasks > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <span className="font-medium">{overdueTasks}</span> nhiệm vụ quá hạn
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}