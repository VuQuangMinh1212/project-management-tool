"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Task } from "@/types/task"
import { TaskStatus, TaskPriority } from "@/types/task"

interface TeamStatsProps {
  tasks: Task[]
}

export function TeamStats({ tasks }: TeamStatsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === TaskStatus.DONE).length
  const inProgressTasks = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length
  const todoTasks = tasks.filter((task) => task.status === TaskStatus.TODO).length

  const highPriorityTasks = tasks.filter((task) => task.priority === TaskPriority.HIGH).length
  const urgentTasks = tasks.filter((task) => task.priority === TaskPriority.URGENT).length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE,
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê Nhóm</CardTitle>
        <CardDescription>Chỉ số hiệu suất nhóm hiện tại</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hoàn thành Tổng thể</span>
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

        {/* Priority Tasks */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Nhiệm Vụ Ưu Tiên</h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ưu Tiên Cao</span>
            <span className="font-medium">{highPriorityTasks}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Khẩn Cấp</span>
            <span className="font-medium text-red-600">{urgentTasks}</span>
          </div>
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
