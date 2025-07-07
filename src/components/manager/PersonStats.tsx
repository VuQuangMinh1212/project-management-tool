"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, Target, BarChart3 } from "lucide-react"
import type { UserWithStats, Plan } from "@/types/database"
import type { DatabaseTaskWithDetails } from "@/types/database"
import type { DateRange } from "@/lib/utils/dateRanges"
import { getDateRangeForPeriod, isDateInRange, formatDateRange } from "@/lib/utils/dateRanges"
import { formatDate } from "@/lib/utils/date"

interface PersonStatsProps {
  user: UserWithStats
  tasks: DatabaseTaskWithDetails[]
  plans: Plan[]
  dateRange: DateRange | null
}

interface PersonStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  averageProgress: number
  completionRate: number
  totalHours: number
  averageTaskTime: number
  overdueTasks: number
}

export function PersonStats({ user, tasks, plans, dateRange }: PersonStatsProps) {
  // Remove all the date range selection logic since it's controlled by parent
  const currentDateRange = dateRange || getDateRangeForPeriod("month", 0)

  // Get user's plan IDs
  const userPlanIds = useMemo(() => {
    return plans
      .filter(plan => plan.user_id === user.id)
      .map(plan => plan.id)
  }, [plans, user.id])

  // Filter tasks for the selected user and date range
  const userTasks = useMemo(() => {
    return tasks.filter(task => {
      // Check if task belongs to user (through plans)
      const belongsToUser = userPlanIds.includes(task.plan_id)
      
      // Check if task is within date range
      const isInRange = task.created_at ? isDateInRange(task.created_at, currentDateRange) : false
      
      return belongsToUser && isInRange
    })
  }, [tasks, userPlanIds, currentDateRange])

  // Calculate statistics for the filtered tasks
  const stats = useMemo((): PersonStats => {
    const totalTasks = userTasks.length
    const completedTasks = userTasks.filter(task => task.status === "done").length
    const inProgressTasks = userTasks.filter(task => task.status === "in_progress").length
    const todoTasks = userTasks.filter(task => task.status === "todo").length
    
    const averageProgress = totalTasks > 0 
      ? userTasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks 
      : 0
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    // Calculate estimated hours (assuming 8 hours per task on average)
    const totalHours = totalTasks * 8
    const averageTaskTime = completedTasks > 0 ? totalHours / completedTasks : 0
    
    // Count overdue tasks
    const now = new Date()
    const overdueTasks = userTasks.filter(task => 
      task.end_date && 
      new Date(task.end_date) < now && 
      task.status !== "done"
    ).length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      averageProgress,
      completionRate,
      totalHours,
      averageTaskTime,
      overdueTasks,
    }
  }, [userTasks])

  // Calculate trends by comparing with previous period - simplified without dynamic period selection
  const previousPeriodStats = useMemo(() => {
    if (!dateRange) return null
    
    // Use a simple previous month comparison
    const previousRange = getDateRangeForPeriod("month", 1)
    const previousTasks = tasks.filter(task => {
      const belongsToUser = userPlanIds.includes(task.plan_id)
      const isInRange = task.created_at ? isDateInRange(task.created_at, previousRange) : false
      return belongsToUser && isInRange
    })
    
    const prevCompleted = previousTasks.filter(task => task.status === "done").length
    const prevTotal = previousTasks.length
    const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0
    
    return {
      completionRate: prevCompletionRate,
      totalTasks: prevTotal,
    }
  }, [tasks, userPlanIds, dateRange])

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  const formatTrend = (current: number, previous: number) => {
    const diff = current - previous
    const sign = diff > 0 ? "+" : ""
    return `${sign}${diff.toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <Badge variant={user.role === "manager" ? "default" : "secondary"}>
            {user.role}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <Calendar className="inline h-4 w-4 mr-1" />
          {formatDateRange(currentDateRange)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Tổng Nhiệm vụ</div>
            {previousPeriodStats && (
              <div className="flex items-center justify-center text-xs mt-1">
                {getTrendIcon(stats.totalTasks, previousPeriodStats.totalTasks)}
                <span className="ml-1">
                  {formatTrend(stats.totalTasks, previousPeriodStats.totalTasks)}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <div className="text-sm text-muted-foreground">Hoàn thành</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.completionRate.toFixed(1)}% tỷ lệ hoàn thành
            </div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgressTasks}</div>
            <div className="text-sm text-muted-foreground">Đang thực hiện</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <div className="text-sm text-muted-foreground">Quá hạn</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{stats.averageProgress.toFixed(1)}%</span>
          </div>
          <Progress value={stats.averageProgress} className="h-3" />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium">{stats.completionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Tỷ lệ Hoàn thành</div>
              {previousPeriodStats && (
                <div className="flex items-center text-xs mt-1">
                  {getTrendIcon(stats.completionRate, previousPeriodStats.completionRate)}
                  <span className="ml-1">
                    {formatTrend(stats.completionRate, previousPeriodStats.completionRate)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">{stats.totalHours}</div>
              <div className="text-sm text-muted-foreground">Ước tính Giờ</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Target className="h-5 w-5 text-purple-500" />
            <div>
              <div className="font-medium">{stats.averageTaskTime.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Thời gian TB/Nhiệm vụ</div>
            </div>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Task Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{stats.todoTasks}</div>
              <div className="text-xs text-muted-foreground">To Do</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">{stats.inProgressTasks}</div>
              <div className="text-xs text-muted-foreground">Đang thực hiện</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{stats.completedTasks}</div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
          </div>
        </div>

        {/* Recent Tasks Preview */}
        {userTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Recent Tasks</h4>
            <div className="space-y-2">
              {userTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.plan_title && `${task.plan_title} • `}
                      {task.created_at && formatDate(task.created_at, "MMM dd")}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      task.status === "done" ? "default" :
                      task.status === "in_progress" ? "secondary" :
                      "outline"
                    } className="text-xs">
                      {task.status.replace("_", " ")}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {task.progress}%
                    </div>
                  </div>
                </div>
              ))}
              {userTasks.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{userTasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
