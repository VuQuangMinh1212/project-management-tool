"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Users, TrendingUp } from "lucide-react"
import { PersonStats } from "./PersonStats"
import { SearchWithSuggestions } from "@/components/shared/ui/SearchWithSuggestions"
import { DateRangePicker } from "@/components/shared/ui/DateRangePicker"
import type { UserWithStats, Plan } from "@/types/database"
import type { DatabaseTaskWithDetails } from "@/types/database"
import type { DateRange } from "@/lib/utils/dateRanges"
import { getDateRangeForPeriod, isDateInRange } from "@/lib/utils/dateRanges"

interface TeamPerformanceReportProps {
  users: UserWithStats[]
  tasks: DatabaseTaskWithDetails[]
  plans: Plan[]
}

export function TeamPerformanceReport({ users, tasks, plans }: TeamPerformanceReportProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [sortBy, setSortBy] = useState<string>("completion-rate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [hasInteracted, setHasInteracted] = useState(false)

  // Filter employees only (managers typically don't have task assignments)
  const employees = useMemo(() => {
    return users.filter(user => user.role === "employee")
  }, [users])

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<{ value: string; category?: string }>()
    
    employees.forEach(user => {
      suggestions.add({ value: user.name, category: "Name" })
      suggestions.add({ value: user.email, category: "Email" })
    })
    
    return Array.from(suggestions)
  }, [employees])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.trim() && !hasInteracted) {
      // When user starts searching, set default to "This Month" and mark as interacted
      setDateRange(getDateRangeForPeriod("month", 0))
      setHasInteracted(true)
    }
  }

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRange | null) => {
    setDateRange(newDateRange)
    setHasInteracted(true)
  }

  // Determine if we should show results
  const shouldShowResults = hasInteracted || searchQuery.trim().length > 0

  // Filter and sort users (only when we should show results)
  const filteredAndSortedUsers = useMemo(() => {
    if (!shouldShowResults) return []

    let filtered = employees

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    // Apply role filter (future expansion for different employee types)
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    // Calculate performance metrics for sorting (only if we have a date range)
    if (!dateRange) return []

    const usersWithMetrics = filtered.map(user => {
      const userPlanIds = plans
        .filter(plan => plan.user_id === user.id)
        .map(plan => plan.id)
      
      // Filter tasks by date range
      const userTasks = tasks.filter(task => {
        const belongsToUser = userPlanIds.includes(task.plan_id)
        const isInRange = task.created_at ? isDateInRange(task.created_at, dateRange) : false
        return belongsToUser && isInRange
      })

      const completedTasks = userTasks.filter(task => task.status === "done").length
      const totalTasks = userTasks.length
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      const averageProgress = totalTasks > 0 
        ? userTasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks 
        : 0

      return {
        ...user,
        metrics: {
          totalTasks,
          completedTasks,
          completionRate,
          averageProgress,
        }
      }
    })

    // Sort users based on selected criteria
    usersWithMetrics.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortBy) {
        case "completion-rate":
          aValue = a.metrics.completionRate
          bValue = b.metrics.completionRate
          break
        case "total-tasks":
          aValue = a.metrics.totalTasks
          bValue = b.metrics.totalTasks
          break
        case "average-progress":
          aValue = a.metrics.averageProgress
          bValue = b.metrics.averageProgress
          break
        case "name":
          return sortOrder === "asc" 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        default:
          aValue = a.metrics.completionRate
          bValue = b.metrics.completionRate
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    return usersWithMetrics
  }, [employees, searchQuery, selectedRole, sortBy, sortOrder, plans, tasks, dateRange, shouldShowResults])

  // Calculate team summary statistics (only when showing results)
  const teamSummary = useMemo(() => {
    if (!shouldShowResults || !dateRange) {
      return {
        totalMembers: employees.length,
        activeMembersInPeriod: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        averageCompletionRate: 0,
      }
    }

    const allUserPlanIds = plans
      .filter(plan => employees.some(user => user.id === plan.user_id))
      .map(plan => plan.id)
    
    const allUserTasks = tasks.filter(task => {
      const belongsToUser = allUserPlanIds.includes(task.plan_id)
      const isInRange = task.created_at ? isDateInRange(task.created_at, dateRange) : false
      return belongsToUser && isInRange
    })

    const totalTasks = allUserTasks.length
    const completedTasks = allUserTasks.filter(task => task.status === "done").length
    const inProgressTasks = allUserTasks.filter(task => task.status === "in_progress").length
    const averageCompletionRate = filteredAndSortedUsers.length > 0 
      ? filteredAndSortedUsers.reduce((sum, user) => sum + user.metrics.completionRate, 0) / filteredAndSortedUsers.length
      : 0

    return {
      totalMembers: employees.length,
      activeMembersInPeriod: filteredAndSortedUsers.filter(user => user.metrics.totalTasks > 0).length,
      totalTasks,
      completedTasks,
      inProgressTasks,
      averageCompletionRate,
    }
  }, [employees, filteredAndSortedUsers, plans, tasks, shouldShowResults, dateRange])

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Báo cáo Hiệu suất Nhóm</h2>
            <p className="text-muted-foreground">Thống kê cá nhân và số liệu hiệu suất</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <SearchWithSuggestions
              placeholder="Tìm kiếm thành viên nhóm (tự động đặt thành Tháng này)..."
              value={searchQuery}
              onChange={handleSearchChange}
              suggestions={searchSuggestions}
            />
          </div>
          
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-64"
          />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completion-rate">Tỷ lệ Hoàn thành</SelectItem>
              <SelectItem value="total-tasks">Tổng Nhiệm vụ</SelectItem>
              <SelectItem value="average-progress">Tiến độ TB</SelectItem>
              <SelectItem value="name">Tên</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"} {sortOrder.toUpperCase()}
          </Button>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{teamSummary.totalMembers}</div>
                <div className="text-sm text-muted-foreground">Thành viên Nhóm</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{teamSummary.activeMembersInPeriod}</div>
                <div className="text-sm text-muted-foreground">Hoạt động trong Kỳ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{teamSummary.completedTasks}</div>
            <div className="text-sm text-muted-foreground">Nhiệm vụ Hoàn thành</div>
            <div className="text-xs text-green-600">
              {teamSummary.totalTasks > 0 ? ((teamSummary.completedTasks / teamSummary.totalTasks) * 100).toFixed(1) : 0}% của tổng
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{teamSummary.averageCompletionRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Tỷ lệ Hoàn thành TB</div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Individual Performance</h3>
          {shouldShowResults && (
            <Badge variant="secondary">
              {filteredAndSortedUsers.length} member{filteredAndSortedUsers.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {!shouldShowResults ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Bắt đầu bằng cách tìm kiếm hoặc lọc</h3>
              <p className="text-muted-foreground mb-4">
                Để tối ưu hiệu suất với nhóm lớn, vui lòng tìm kiếm thành viên cụ thể hoặc áp dụng bộ lọc để xem thống kê cá nhân.
              </p>
              <div className="text-sm text-muted-foreground">
                💡 <strong>Mẹo:</strong> Khi bạn tìm kiếm, bộ lọc thời gian mặc định sẽ được đặt thành "Tháng này"
              </div>
            </CardContent>
          </Card>
        ) : filteredAndSortedUsers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedUsers.map(user => (
              <PersonStats
                key={user.id}
                user={user}
                tasks={tasks}
                plans={plans}
                dateRange={dateRange}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy thành viên nhóm</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc chọn khoảng thời gian khác"
                  : "Không có thành viên nhóm nào phù hợp với bộ lọc hiện tại"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
