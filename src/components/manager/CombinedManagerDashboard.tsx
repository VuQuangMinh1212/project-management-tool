"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock, CheckCircle, Download } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamStats } from "./TeamStats";
import { StaffStats } from "./StaffStats";
import { ReportChart } from "./ReportChart";
import { OverdueTasks } from "./OverdueTasks";
import { RecentTasks } from "./RecentTasks";
import { TeamPerformanceReport } from "./TeamPerformanceReport";
import { SearchWithSuggestions } from "@/components/shared/ui/SearchWithSuggestions";
import type { Task } from "@/types/task";
import { TaskStatus } from "@/types/task";
import type { TeamMember } from "@/types/user";
import { getLegacyTasks, getLegacyTeamMembers } from "@/mock/data/legacy-compatibility";
import { mockUsersWithStats, mockTasksWithDetails, mockPlans } from "@/mock/data";
import { processTasksStatus } from "@/lib/utils/taskUtils";

const mockTeamMembers: TeamMember[] = getLegacyTeamMembers();

export function CombinedManagerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");

  useEffect(() => {
    setTimeout(() => {
      // Process tasks to automatically set overdue status
      const processedTasks = processTasksStatus(getLegacyTasks());
      setTasks(processedTasks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "done"
  ).length;

  const selectedStaff = selectedStaffId
    ? teamMembers.find((member) => member.id === selectedStaffId)
    : null;

  // Generate search suggestions for staff names only
  const staffSearchSuggestions = teamMembers.map(member => ({
    value: member.name,
    category: "staff"
  }));

  // Handle staff selection from search
  const handleStaffSelect = (staffName: string) => {
    const staff = teamMembers.find(member => member.name === staffName);
    if (staff) {
      setSelectedStaffId(staff.id);
      setStaffSearchQuery(staffName);
    }
  };

  // Clear staff selection
  const clearStaffSelection = () => {
    setSelectedStaffId(null);
    setStaffSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bảng Điều Khiển Quản Lý & Phân Tích</h1>
          <p className="text-muted-foreground">Tổng quan nhóm, theo dõi hiệu suất và phân tích chi tiết</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhiệm vụ</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ hoàn thành {totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
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
              {overdueTasks}
            </div>
            <p className="text-xs text-muted-foreground">Cần chú ý</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="team-performance">Hiệu suất Nhóm</TabsTrigger>
          <TabsTrigger value="staff">Hiệu suất cá nhân</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamStats tasks={tasks} />
            <OverdueTasks tasks={tasks} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <ReportChart 
              tasks={tasks} 
              excludeStatuses={[TaskStatus.DRAFT, TaskStatus.APPROVED, TaskStatus.PENDING_APPROVAL]} 
            />
          </div>
        </TabsContent>

        <TabsContent value="team-performance" className="space-y-4">
          <TeamPerformanceReport
            users={mockUsersWithStats}
            tasks={mockTasksWithDetails}
            plans={mockPlans}
          />
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Hiệu suất cá nhân</h3>
            <div className="flex items-center gap-4">
              <div className="w-[300px]">
                <SearchWithSuggestions
                  placeholder="Tìm kiếm nhân viên theo tên..."
                  value={staffSearchQuery}
                  onChange={setStaffSearchQuery}
                  suggestions={staffSearchSuggestions}
                  onSuggestionSelect={handleStaffSelect}
                  className="w-full"
                />
              </div>
              {selectedStaffId && (
                <Button variant="outline" onClick={clearStaffSelection}>
                  Bỏ chọn
                </Button>
              )}
            </div>
          </div>

          {selectedStaff ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StaffStats staffMember={selectedStaff} tasks={tasks} />
                <Card>
                  <CardHeader>
                    <CardTitle>Phân bổ Nhiệm vụ</CardTitle>
                    <CardDescription>
                      Nhiệm vụ theo trạng thái của {selectedStaff.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportChart
                      tasks={tasks.filter(
                        (task) => task.assigneeId === selectedStaff.id
                      )}
                      type="status"
                      excludeStatuses={[TaskStatus.DRAFT, TaskStatus.APPROVED, TaskStatus.PENDING_APPROVAL]}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <RecentTasks 
                  tasks={tasks.filter(
                    (task) => task.assigneeId === selectedStaff.id
                  )}
                  initialDisplayCount={5}
                  staffName={selectedStaff.name}
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">
                  Vui lòng chọn một nhân viên để xem thống kê của họ
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng Hoàn thành Nhiệm vụ</CardTitle>
                <CardDescription>Tỷ lệ hoàn thành hàng tuần theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportChart 
                  tasks={tasks} 
                  type="status" 
                  excludeStatuses={[TaskStatus.DRAFT, TaskStatus.APPROVED, TaskStatus.PENDING_APPROVAL]} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xếp hạng Năng suất Nhóm</CardTitle>
                <CardDescription>Xếp hạng hiệu suất theo tỷ lệ hoàn thành</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsersWithStats.filter(user => user.role === "employee").map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.stats?.totalTasks || 0} tasks</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{user.stats?.completionRate || 0}%</div>
                        <div className="text-sm text-muted-foreground">tỷ lệ hoàn thành</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Phân tích Độ ưu tiên</CardTitle>
              <CardDescription>Nhiệm vụ theo mức độ ưu tiên</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportChart tasks={tasks} type="priority" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
