"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Calendar, ChevronDown, Users, TrendingUp, Clock, Target } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { SearchWithSuggestions } from "@/components/shared/ui/SearchWithSuggestions"
import type { DateRange as CalendarDateRange } from "react-day-picker"
import { ReportChart } from "./ReportChart"
import { StaffStats } from "./StaffStats"
import { RecentTasks } from "./RecentTasks"
import type { TeamMember } from "@/types/user"
import type { Task } from "@/types/task"
import { getLegacyTeamMembers, getLegacyTasks } from "@/mock/data/legacy-compatibility"
import { mockUsersWithStats, mockTasksWithDetails, mockPlans } from "@/mock/data"
import { format, subDays, subWeeks, subMonths, subQuarters, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns"

interface DateRange {
  from?: Date
  to?: Date
}

interface TimeRangeFilter {
  label: string
  value: string
  getRange: () => DateRange
}

const timeRangeFilters: TimeRangeFilter[] = [
  {
    label: "Tuần này",
    value: "this_week",
    getRange: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date())
    })
  },
  {
    label: "Tuần trước",
    value: "last_week",
    getRange: () => ({
      from: startOfWeek(subWeeks(new Date(), 1)),
      to: endOfWeek(subWeeks(new Date(), 1))
    })
  },
  {
    label: "Tháng này", 
    value: "this_month",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: "Tháng trước", 
    value: "last_month",
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1))
    })
  },
  {
    label: "Quý này",
    value: "this_quarter", 
    getRange: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date())
    })
  },
  {
    label: "Quý trước",
    value: "last_quarter", 
    getRange: () => ({
      from: startOfQuarter(subQuarters(new Date(), 1)),
      to: endOfQuarter(subQuarters(new Date(), 1))
    })
  },
  {
    label: "Năm này",
    value: "this_year",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date())
    })
  },
  {
    label: "Năm trước",
    value: "last_year",
    getRange: () => ({
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1))
    })
  },
  {
    label: "7 ngày qua",
    value: "last_7_days",
    getRange: () => ({
      from: subDays(new Date(), 7),
      to: new Date()
    })
  },
  {
    label: "30 ngày qua",
    value: "last_30_days", 
    getRange: () => ({
      from: subDays(new Date(), 30),
      to: new Date()
    })
  },
  {
    label: "90 ngày qua",
    value: "last_90_days", 
    getRange: () => ({
      from: subDays(new Date(), 90),
      to: new Date()
    })
  }
]

export function TeamManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [timeRangeFilter, setTimeRangeFilter] = useState("this_month")
  const [customDateRange, setCustomDateRange] = useState<CalendarDateRange | undefined>()
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false)

  const teamMembers: TeamMember[] = getLegacyTeamMembers()
  const allTasks: Task[] = getLegacyTasks()

  const searchSuggestions = useMemo(() => {
    return teamMembers.map(member => ({
      value: member.name,
      label: member.name,
      description: `${member.role} - ${member.email}`,
      category: "Thành viên Nhóm"
    }))
  }, [teamMembers])

  const filteredTeamMembers = useMemo(() => {
    if (!searchQuery.trim()) return teamMembers
    
    const query = searchQuery.toLowerCase()
    return teamMembers.filter(member => 
      member.name.toLowerCase().includes(query)
    )
  }, [teamMembers, searchQuery])

  const selectedStaff = teamMembers.find(member => member.id === selectedStaffId)

  const currentDateRange = useMemo(() => {
    if (timeRangeFilter === "custom" && customDateRange) {
      return customDateRange
    }
    const filter = timeRangeFilters.find(f => f.value === timeRangeFilter)
    return filter?.getRange() || { from: new Date(), to: new Date() }
  }, [timeRangeFilter, customDateRange])

  const filteredTasks = useMemo(() => {
    if (!currentDateRange?.from || !currentDateRange?.to) return allTasks
    
    return allTasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= currentDateRange.from! && taskDate <= currentDateRange.to!
    })
  }, [allTasks, currentDateRange])

  const teamStats = useMemo(() => {
    const stats = {
      totalTasks: filteredTasks.length,
      completedTasks: filteredTasks.filter(task => task.status === "done").length,
      inProgressTasks: filteredTasks.filter(task => task.status === "in_progress").length,
      overdueTasks: filteredTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"
      ).length
    }
    
    return {
      ...stats,
      completionRate: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
    }
  }, [filteredTasks])

  const handleStaffSelect = (staffName: string) => {
    const staff = teamMembers.find(member => member.name === staffName)
    if (staff) {
      setSelectedStaffId(staff.id)
      setSearchQuery(staffName)
    }
  }

  const clearSelection = () => {
    setSelectedStaffId(null)
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Nhóm</h1>
          <p className="text-gray-600">
            Giám sát hiệu suất nhóm và thống kê nhân viên
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tổng quan Nhóm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Staff Search */}
            <div className="flex-1 min-w-64">
              <SearchWithSuggestions
                placeholder="Tìm kiếm thành viên nhóm..."
                value={searchQuery}
                onChange={setSearchQuery}
                suggestions={searchSuggestions}
                onSuggestionSelect={handleStaffSelect}
                className="w-full"
              />
            </div>

            {/* Time Range Filter */}
            <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeFilters.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Tuỳ chỉnh</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Date Range Picker */}
            {timeRangeFilter === "custom" && (
              <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    {customDateRange?.from && customDateRange?.to
                      ? `${format(customDateRange.from, "MMM dd")} - ${format(customDateRange.to, "MMM dd")}`
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={customDateRange}
                    onSelect={setCustomDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Clear Selection */}
            {selectedStaffId && (
              <Button variant="outline" onClick={clearSelection}>
                Bỏ chọn
              </Button>
            )}
          </div>

          {/* Date Range Display */}
          <div className="text-sm text-gray-600">
            Hiển thị dữ liệu cho: {" "}
            {currentDateRange?.from && currentDateRange?.to && (
              <span className="font-medium">
                {format(currentDateRange.from, "MMM dd, yyyy")} - {format(currentDateRange.to, "MMM dd, yyyy")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhiệm vụ</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Trong khoảng thời gian đã chọn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ hoàn thành {teamStats.completionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {teamStats.overdueTasks}
            </div>
            <p className="text-xs text-muted-foreground">Cần chú ý</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">Tổng quan Nhóm</TabsTrigger>
          {selectedStaff && (
            <TabsTrigger value="individual">
              Chi tiết {selectedStaff.name}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thành viên Nhóm</CardTitle>
              <CardDescription>
                Tổng quan hiệu suất của các thành viên nhóm trong khoảng thời gian đã chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeamMembers.map((member) => {
                  const memberTasks = filteredTasks.filter(task => task.assigneeId === member.id)
                  const completedTasks = memberTasks.filter(task => task.status === "done" || task.status === "finished").length
                  const inProgressTasks = memberTasks.filter(task => task.status === "in_progress").length
                  const totalTasks = memberTasks.length
                  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedStaffId === member.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStaffId(member.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {completedTasks}/{totalTasks} nhiệm vụ đã hoàn thành
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {inProgressTasks} đang thực hiện
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={productivity} className="w-20" />
                            <span className="text-xs text-muted-foreground">
                              {productivity}%
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={productivity >= 70 ? "default" : "secondary"}
                        >
                          {productivity >= 70 ? "Tốt" : "Cần chú ý"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedStaff && (
          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-6">
              {/* Staff Overview Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Hiệu suất Nhân viên - {selectedStaff.name}</span>
                    <Badge variant="secondary">{selectedStaff.role}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Phân tích hiệu suất chi tiết cho khoảng thời gian đã chọn: {" "}
                    {currentDateRange?.from && currentDateRange?.to && (
                      <span className="font-medium text-foreground">
                        {format(currentDateRange.from, "MMM dd, yyyy")} - {format(currentDateRange.to, "MMM dd, yyyy")}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const staffTasks = filteredTasks.filter(task => task.assigneeId === selectedStaff.id)
                      const completedTasks = staffTasks.filter(task => task.status === "done" || task.status === "finished").length
                      const inProgressTasks = staffTasks.filter(task => task.status === "in_progress").length
                      const delayedTasks = staffTasks.filter(task => task.status === "delayed").length
                      const totalTasks = staffTasks.length
                      const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                      return (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{totalTasks}</div>
                            <div className="text-xs text-muted-foreground">Tổng Nhiệm vụ</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                            <div className="text-xs text-muted-foreground">Đã hoàn thành</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
                            <div className="text-xs text-muted-foreground">Đang thực hiện</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{delayedTasks}</div>
                            <div className="text-xs text-muted-foreground">Trì hoãn</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Stats and Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StaffStats 
                  staffMember={selectedStaff} 
                  tasks={filteredTasks.filter(task => task.assigneeId === selectedStaff.id)} 
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Phân phối Nhiệm vụ</CardTitle>
                    <CardDescription>
                      Nhiệm vụ theo trạng thái cho {selectedStaff.name} trong khoảng thời gian đã chọn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportChart
                      tasks={filteredTasks.filter(task => task.assigneeId === selectedStaff.id)}
                      type="status"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Tasks */}
              <div className="grid grid-cols-1 gap-6">
                <RecentTasks 
                  tasks={filteredTasks.filter(task => task.assigneeId === selectedStaff.id)}
                  initialDisplayCount={10}
                  staffName={selectedStaff.name}
                />
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
