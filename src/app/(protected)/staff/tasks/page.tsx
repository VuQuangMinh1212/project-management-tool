"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TaskBoard } from "@/components/staff/TaskBoard"
import { TaskModal } from "@/components/staff/TaskModal"
import { BulkTaskCreator } from "@/components/staff/BulkTaskCreator"
import { SearchWithSuggestions } from "@/components/shared/ui/SearchWithSuggestions"
import { FilterDropdown } from "@/components/shared/ui/FilterDropdown"
import type { Task } from "@/types/task"
import type { CreateTaskData } from "@/types/task"
import { TaskStatus, TaskPriority } from "@/types/task"
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/constants/taskStatus"
import { getLegacyTasks } from "@/mock/data/legacy-compatibility"
import { useRealTimeUpdates } from "@/hooks/socket/useRealTimeUpdates"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBulkCreatorOpen, setIsBulkCreatorOpen] = useState(false)

  // Real-time updates
  useRealTimeUpdates({
    onTaskUpdate: (event) => {
      setTasks((prev) => prev.map((task) => (task.id === event.taskId ? { ...task, ...event.updates } : task)))
    },
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(getLegacyTasks())
      setIsLoading(false)
    }, 1000)
  }, [])

  // Generate filter groups
  const filterGroups = useMemo(() => {
    const assigneeOptions = Array.from(new Set(tasks.map(task => task.assigneeName)))
      .filter((assignee): assignee is string => Boolean(assignee))
      .map(assignee => ({
        label: assignee,
        value: assignee,
        count: tasks.filter(task => task.assigneeName === assignee).length
      }));

    const projectOptions = Array.from(new Set(tasks.map(task => task.project?.name)))
      .filter((project): project is string => Boolean(project))
      .map(project => ({
        label: project,
        value: project,
        count: tasks.filter(task => task.project?.name === project).length
      }));

    const statusOptions = Object.values(TaskStatus).map(status => ({
      label: TASK_STATUS_LABELS[status],
      value: status,
      count: tasks.filter(task => task.status === status).length
    }));

    const priorityOptions = Object.values(TaskPriority).map(priority => ({
      label: TASK_PRIORITY_LABELS[priority],
      value: priority,
      count: tasks.filter(task => task.priority === priority).length
    }));

    const tagOptions = Array.from(new Set(tasks.flatMap(task => task.tags || [])))
      .filter((tag): tag is string => Boolean(tag))
      .map(tag => ({
        label: tag,
        value: tag,
        count: tasks.filter(task => task.tags?.includes(tag)).length
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
      {
        id: "assignee",
        label: "Assignee",
        options: assigneeOptions,
        type: "multiple" as const
      },
      {
        id: "project",
        label: "Project",
        options: projectOptions,
        type: "multiple" as const
      },
      {
        id: "tags",
        label: "Tags",
        options: tagOptions,
        type: "multiple" as const
      }
    ].filter(group => group.options.length > 0);
  }, [tasks]);

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<{ value: string; category?: string }>();

    tasks.forEach(task => {
      // Task titles
      suggestions.add({ value: task.title, category: "Title" });
      
      // Assignee names
      if (task.assigneeName) {
        suggestions.add({ value: task.assigneeName, category: "Assignee" });
      }
      
      // Project names
      if (task.project?.name) {
        suggestions.add({ value: task.project.name, category: "Project" });
      }
      
      // Tags
      task.tags?.forEach(tag => {
        suggestions.add({ value: tag, category: "Tag" });
      });
    });

    return Array.from(suggestions);
  }, [tasks]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assigneeName?.toLowerCase().includes(searchLower) ||
        task.project?.name?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply selected filters
    Object.entries(selectedFilters).forEach(([filterType, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(task => {
          switch (filterType) {
            case "status":
              return values.includes(task.status);
            case "priority":
              return values.includes(task.priority);
            case "assignee":
              return task.assigneeName && values.includes(task.assigneeName);
            case "project":
              return task.project?.name && values.includes(task.project.name);
            case "tags":
              return task.tags?.some(tag => values.includes(tag));
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [tasks, searchQuery, selectedFilters]);

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }

  const handleTaskCreate = (newTask: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, task])
  }
  
  const handleMultipleTaskCreate = (newTasks: Omit<Task, "id" | "createdAt" | "updatedAt">[]) => {
    const createdTasks = newTasks.map((newTask, index) => ({
      ...newTask,
      id: `${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    setTasks((prev) => [...prev, ...createdTasks]);
  }

  const handleCreateBulkTasks = (weekSubmittedFor: string, tasksData: any[]) => {
    const newTasks = tasksData.map((taskData, index) => ({
      ...taskData,
      id: `bulk-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      weekSubmittedFor,
      status: TaskStatus.PENDING_APPROVAL,
      assigneeId: "current-user",
      assigneeName: "Người dùng hiện tại",
    }));
    
    setTasks((prev) => [...prev, ...newTasks]);
    setIsBulkCreatorOpen(false);
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nhiệm Vụ Của Tôi</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi các nhiệm vụ được giao</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nhiệm Vụ Mới
          </Button>
          <Button onClick={() => setIsBulkCreatorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Nhiều Nhiệm Vụ
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <SearchWithSuggestions
          placeholder="Tìm kiếm nhiệm vụ..."
          value={searchQuery}
          onChange={setSearchQuery}
          suggestions={searchSuggestions}
          className="flex-1 max-w-sm"
        />
        
        {filterGroups.length > 0 && (
          <FilterDropdown
            groups={filterGroups}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />
        )}
      </div>

      {/* Active filters display */}
      {Object.values(selectedFilters).some(filters => filters.length > 0) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Bộ lọc hiện tại:</span>
          {Object.entries(selectedFilters).map(([filterType, values]) =>
            values.map(value => (
              <span
                key={`${filterType}-${value}`}
                className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
              >
                {filterType}: {value}
                <button
                  onClick={() => {
                    const newFilters = { ...selectedFilters };
                    newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
                    if (newFilters[filterType].length === 0) {
                      delete newFilters[filterType];
                    }
                    setSelectedFilters(newFilters);
                  }}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      )}

      {/* Task Board */}
      <TaskBoard 
        tasks={filteredTasks} 
        onTaskUpdate={handleTaskUpdate} 
        onTaskCreate={handleTaskCreate} 
        onCreateMultiple={handleMultipleTaskCreate}
        searchTerm={searchQuery}
        selectedFilters={selectedFilters}
        showHeader={false}
      />

      {/* Create Task Modal */}
      <TaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(task) => {
          // Convert CreateTaskData to the format expected by handleTaskCreate
          const taskWithDefaults = {
            ...task,
            status: TaskStatus.DRAFT,
            assigneeName: "Người dùng hiện tại", // This should come from auth context
          };
          handleTaskCreate(taskWithDefaults);
          setIsCreateModalOpen(false);
        }}
      />

      {/* Bulk Task Creator */}
      <BulkTaskCreator
        open={isBulkCreatorOpen}
        onClose={() => setIsBulkCreatorOpen(false)}
        onCreateBulk={handleCreateBulkTasks}
      />
    </div>
  )
}
