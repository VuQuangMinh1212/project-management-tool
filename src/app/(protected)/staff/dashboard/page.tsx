"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskBoard } from "@/components/staff/TaskBoard"
import { DraftTaskManager } from "@/components/staff/DraftTaskManager"
import { TaskModal } from "@/components/staff/TaskModal"
import { BulkTaskCreator } from "@/components/staff/BulkTaskCreator"
import { FilterDropdown } from "@/components/shared/ui/FilterDropdown"
import { SearchWithSuggestions } from "@/components/shared/ui/SearchWithSuggestions"
import type { Task, CreateTaskData, UpdateTaskData } from "@/types/task"
import { TaskStatus, TaskPriority } from "@/types/task"
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/constants/taskStatus"
import { getLegacyTasks } from "@/mock/data/legacy-compatibility"
import { useAuth } from "@/hooks/auth/useAuth"
import { getCurrentWeek } from "@/lib/utils/weekUtils"
import { processTasksStatus } from "@/lib/utils/taskUtils"

export default function StaffDashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isBulkCreatorOpen, setIsBulkCreatorOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  // Separate tasks by status
  const draftTasks = tasks.filter(task => task.status === TaskStatus.DRAFT)
  const activeTasks = tasks.filter(task => 
    task.status !== TaskStatus.DRAFT && 
    task.status !== TaskStatus.PENDING_APPROVAL
  )
  const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING_APPROVAL)

  // Apply filter to determine which sections to show
  const shouldShowDrafts = statusFilter === "all" || statusFilter === "drafts" || (statusFilter === "drafts" && draftTasks.length > 0)
  const shouldShowPending = statusFilter === "all" || statusFilter === "pending" || (statusFilter === "pending" && pendingTasks.length > 0)
  const shouldShowActive = statusFilter === "all" || statusFilter === "active" || (statusFilter === "active" && activeTasks.length > 0)

  // Generate filter groups for advanced filtering
  const filterGroups = useMemo(() => {
    const allTasks = [...draftTasks, ...activeTasks, ...pendingTasks];
    
    const statusOptions = Object.values(TaskStatus).map(status => ({
      label: TASK_STATUS_LABELS[status],
      value: status,
      count: allTasks.filter(task => task.status === status).length
    }));

    const priorityOptions = Object.values(TaskPriority).map(priority => ({
      label: TASK_PRIORITY_LABELS[priority],
      value: priority,
      count: allTasks.filter(task => task.priority === priority).length
    }));

    return [
      {
        id: "status",
        label: "Status",
        options: statusOptions,
        type: "multiple" as const
      },
      {
        id: "priority",
        label: "Priority",
        options: priorityOptions,
        type: "multiple" as const
      },
    ];
  }, [draftTasks, activeTasks, pendingTasks]);

  // Filter logic for hiding empty sections
  const getVisibleSections = () => {
    const sections = []
    
    if (statusFilter === "all") {
      // Show all sections when no filter is applied
      sections.push("drafts", "pending", "active")
    } else {
      // Only show sections that match the filter AND have tasks
      if (statusFilter === "drafts" && draftTasks.length > 0) sections.push("drafts")
      if (statusFilter === "pending" && pendingTasks.length > 0) sections.push("pending")
      if (statusFilter === "active" && activeTasks.length > 0) sections.push("active")
    }
    
    return sections
  }

  const visibleSections = getVisibleSections()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const legacyTasks = getLegacyTasks()
      
      // Add some mock draft and pending tasks for demonstration
      const mockTasks: Task[] = [
        ...legacyTasks,
        {
          id: "draft-1",
          title: "Review quarterly reports",
          description: "Analyze Q4 performance metrics and prepare summary",
          status: TaskStatus.DRAFT,
          priority: "medium" as any,
          assigneeId: user?.id || "user-1",
          assigneeName: user?.name || "John Doe",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          weekSubmittedFor: getCurrentWeek(),
          estimatedHours: 3,
          isDraft: true,
        },
        {
          id: "draft-2", 
          title: "Update project documentation",
          description: "Revise technical specifications and user guides",
          status: TaskStatus.DRAFT,
          priority: "low" as any,
          assigneeId: user?.id || "user-1",
          assigneeName: user?.name || "John Doe",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          weekSubmittedFor: getCurrentWeek(),
          estimatedHours: 2,
          isDraft: true,
        },
        {
          id: "pending-1",
          title: "Client presentation preparation",
          description: "Create slides and demo for upcoming client meeting",
          status: TaskStatus.PENDING_APPROVAL,
          priority: "high" as any,
          assigneeId: user?.id || "user-1", 
          assigneeName: user?.name || "John Doe",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          weekSubmittedFor: getCurrentWeek(),
          submittedAt: new Date().toISOString(),
          estimatedHours: 4,
        }
      ]
      
      // Process tasks to automatically set overdue status
      const processedTasks = processTasksStatus(mockTasks)
      setTasks(processedTasks)
      setIsLoading(false)
    }, 1000)
  }, [user])

  const handleTaskUpdate = (taskId: string, updates: UpdateTaskData) => {
    setTasks((prev) => prev.map((task) => 
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    ))
  }

  const handleTaskCreate = (taskData: CreateTaskData) => {
    const task: Task = {
      ...taskData,
      id: Date.now().toString(),
      assigneeName: user?.name || "Unknown",
      assigneeAvatar: user?.avatar,
      status: taskData.isDraft ? TaskStatus.DRAFT : TaskStatus.PENDING_APPROVAL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: taskData.isDraft ? undefined : new Date().toISOString(),
      batchId: taskData.isDraft ? undefined : Date.now().toString(),
    }
    setTasks((prev) => [...prev, task])
  }

  const handleSaveDraft = (taskData: CreateTaskData) => {
    handleTaskCreate({ ...taskData, isDraft: true })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleSubmitBatch = (taskIds: string[], weekSubmittedFor: string) => {
    const batchId = Date.now().toString()
    const submittedAt = new Date().toISOString()
    
    setTasks(prev => prev.map(task => 
      taskIds.includes(task.id) 
        ? { 
            ...task, 
            status: TaskStatus.PENDING_APPROVAL,
            isDraft: false,
            submittedAt,
            batchId,
            weekSubmittedFor,
            updatedAt: new Date().toISOString()
          }
        : task
    ))
  }

  const handleCreateNewTask = () => {
    setEditingTask(undefined)
    setIsTaskModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(undefined)
  }

  const handleCreateBulkTasks = (weekSubmittedFor: string, tasksData: CreateTaskData[]) => {
    const batchId = Date.now().toString()
    const submittedAt = new Date().toISOString()
    
    const newTasks: Task[] = tasksData.map((taskData, index) => ({
      id: `bulk-${Date.now()}-${index}`,
      title: taskData.title,
      description: taskData.description,
      status: TaskStatus.PENDING_APPROVAL,
      priority: taskData.priority,
      assigneeId: taskData.assigneeId,
      assigneeName: user?.name || "Unknown User",
      projectId: taskData.projectId,
      estimatedHours: taskData.estimatedHours,
      weekSubmittedFor: weekSubmittedFor,
      isDraft: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: submittedAt,
      batchId: batchId,
    }))
    
    setTasks(prev => [...prev, ...newTasks])
  }

  const handleSaveBulkDrafts = (weekSubmittedFor: string, tasksData: CreateTaskData[]) => {
    const newTasks: Task[] = tasksData.map((taskData, index) => ({
      id: `draft-bulk-${Date.now()}-${index}`,
      title: taskData.title,
      description: taskData.description,
      status: TaskStatus.DRAFT,
      priority: taskData.priority,
      assigneeId: taskData.assigneeId,
      assigneeName: user?.name || "Unknown User",
      projectId: taskData.projectId,
      estimatedHours: taskData.estimatedHours,
      weekSubmittedFor: weekSubmittedFor,
      isDraft: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    
    setTasks(prev => [...prev, ...newTasks])
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-full overflow-x-auto">
      <div className="space-y-6 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold">Bảng Điều Khiển</h1>
            <p className="text-gray-600">
              Quản lý nhiệm vụ, tạo bản nháp và theo dõi tiến độ công việc của bạn.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Lọc nhiệm vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả Nhiệm Vụ</SelectItem>
                  <SelectItem value="drafts">Chỉ Bản Nháp</SelectItem>
                  <SelectItem value="pending">Chỉ Đang Chờ</SelectItem>
                  <SelectItem value="active">Chỉ Đang Hoạt Động</SelectItem>
                </SelectContent>
              </Select>
              <FilterDropdown 
                groups={filterGroups}
                selectedFilters={selectedFilters}
                onFiltersChange={setSelectedFilters}
              />
            </div>
            {/* Show active lọc */}
            {Object.values(selectedFilters).some(filters => filters.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-blue-600">Bộ lọc hiện tại:</span>
                {Object.entries(selectedFilters).map(([filterType, values]) =>
                  values.map((value) => (
                    <div key={`${filterType}-${value}`} className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <span className="font-medium">{filterType}: {value}</span>
                      <button 
                        onClick={() => {
                          const newFilters = { ...selectedFilters };
                          newFilters[filterType] = values.filter(v => v !== value);
                          if (newFilters[filterType].length === 0) {
                            delete newFilters[filterType];
                          }
                          setSelectedFilters(newFilters);
                        }}
                        className="ml-1 text-blue-400 hover:text-blue-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            <Button variant="outline" onClick={handleCreateNewTask}>
              <Plus className="mr-2 h-4 w-4" />
              Nhiệm Vụ Mới
            </Button>
            <Button onClick={() => setIsBulkCreatorOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Nhiều Nhiệm Vụ
            </Button>
          </div>
        </div>

        <Tabs defaultValue={visibleSections[0] || "drafts"} className="space-y-6">
          {visibleSections.length > 0 && (
            <TabsList className={`grid w-full ${
              visibleSections.length === 1 ? 'grid-cols-1' :
              visibleSections.length === 2 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {visibleSections.includes("drafts") && (
                <TabsTrigger value="drafts" className="relative">
                  Bản Nháp
                  {draftTasks.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {draftTasks.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
              {visibleSections.includes("pending") && (
                <TabsTrigger value="pending" className="relative">
                  Chờ Phê Duyệt
                  {pendingTasks.length > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {pendingTasks.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
              {visibleSections.includes("active") && (
                <TabsTrigger value="active">
                  Nhiệm Vụ Hoạt Động
                  {activeTasks.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {activeTasks.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
          )}

          {visibleSections.includes("drafts") && (
            <TabsContent value="drafts" className="space-y-6">
              <DraftTaskManager
                draftTasks={draftTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onSubmitBatch={handleSubmitBatch}
              />
            </TabsContent>
          )}

          {visibleSections.includes("pending") && (
            <TabsContent value="pending" className="space-y-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Nhiệm Vụ Chờ Phê Duyệt</h3>
                <p className="text-gray-600 mb-6">
                  Những nhiệm vụ này đã được gửi và đang chờ quản lý xem xét.
                </p>
                
                {pendingTasks.length === 0 ? (
                  <p className="text-gray-500">Không có nhiệm vụ nào chờ phê duyệt.</p>
                ) : (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {pendingTasks.map(task => (
                      <div key={task.id} className="p-4 border rounded-lg bg-yellow-50">
                        <div className="flex justify-between items-start">
                          <div className="text-left">
                            <h4 className="font-medium">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              Đã gửi: {task.submittedAt && new Date(task.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Chờ duyệt
                          </span>
                        </div>
                        {task.reviewComment && (
                          <div className="mt-3 p-2 bg-white rounded border-l-4 border-blue-500">
                            <p className="text-sm font-medium">Nhận xét của Quản lý:</p>
                            <p className="text-sm text-gray-700">{task.reviewComment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {visibleSections.includes("active") && (
            <TabsContent value="active" className="space-y-6">
              <TaskBoard 
                tasks={activeTasks} 
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
                showHeader={false}
                statusFilter="all"
                selectedFilters={selectedFilters}
                searchTerm={searchQuery}
              />
            </TabsContent>
          )}

          {/* Show message when no sections are visible due to filtering */}
          {visibleSections.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Không tìm thấy nhiệm vụ</h3>
              <p className="text-gray-500 mb-4">
                Không có nhiệm vụ nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc hoặc tạo một số nhiệm vụ.
              </p>
              <Button onClick={() => setStatusFilter("all")} variant="outline">
                Xóa Bộ Lọc
              </Button>
            </div>
          )}
        </Tabs>
      </div>

      {/* Task Modal */}
      <TaskModal
        task={editingTask}
        open={isTaskModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleTaskUpdate}
        onCreate={handleTaskCreate}
        onSaveDraft={handleSaveDraft}
        userRole="employee"
      />

      {/* Bulk Task Creator */}
      <BulkTaskCreator
        open={isBulkCreatorOpen}
        onClose={() => setIsBulkCreatorOpen(false)}
        onCreateBulk={handleCreateBulkTasks}
        onSaveBulkDrafts={handleSaveBulkDrafts}
      />
    </div>
  )
}
