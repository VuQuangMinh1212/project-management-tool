"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { type Task, TaskStatus } from "@/types/task";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/constants/taskStatus";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth/useAuth";

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onCreateMultiple?: (
    tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[]
  ) => void;
  // Remove search/filter state from TaskBoard since it's controlled by parent
  searchTerm?: string;
  selectedFilters?: Record<string, string[]>;
  showHeader?: boolean; // Control whether to show the header section
  statusFilter?: string; // New prop for status filtering
  excludeStatuses?: TaskStatus[]; // New prop to exclude certain statuses from display
}

export function TaskBoard({
  tasks: propTasks,
  onTaskUpdate,
  onTaskCreate,
  onCreateMultiple,
  searchTerm = "",
  selectedFilters = {},
  showHeader = true,
  statusFilter = "all",
  excludeStatuses = [],
}: TaskBoardProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(propTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sync local tasks with propTasks when prop changes
  useEffect(() => {
    console.log("Syncing tasks with propTasks:", propTasks);
    setTasks(propTasks);
  }, [propTasks]);

  // Filter tasks based on search term and selected filters (passed from parent)
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
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
            case "assignee":
              return task.assigneeName && values.includes(task.assigneeName);
            case "project":
              return task.project?.name && values.includes(task.project.name);
            case "priority":
              return values.includes(task.priority);
            case "tags":
              return task.tags?.some(tag => values.includes(tag));
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [tasks, searchTerm, selectedFilters]);

  const tasksByStatus = useMemo(() => {
    console.log("Re-computing tasksByStatus with filtered tasks:", filteredTasks);
    const grouped = filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);

    Object.values(TaskStatus).forEach((status) => {
      if (!grouped[status]) {
        grouped[status] = [];
      }
    });

    return grouped;
  }, [filteredTasks]);

  // Get columns to display based on status filter
  const columnsToShow = useMemo(() => {
    // Check if there are specific status filters in selectedFilters
    const statusFilters = selectedFilters?.status || [];
    
    let statusesToShow: TaskStatus[];
    
    if (statusFilter === "all" && statusFilters.length === 0) {
      // Show all columns when no status filter is applied
      statusesToShow = Object.values(TaskStatus);
    } else if (statusFilters.length > 0) {
      // Use selectedFilters.status if available (multiple status filters)
      statusesToShow = Object.values(TaskStatus).filter(status => statusFilters.includes(status));
    } else if (statusFilter !== "all") {
      // Use single statusFilter if no selectedFilters.status
      statusesToShow = Object.values(TaskStatus).filter(status => status === statusFilter);
    } else {
      // Fallback to all columns
      statusesToShow = Object.values(TaskStatus);
    }

    // Filter out excluded statuses
    return statusesToShow.filter(status => !excludeStatuses.includes(status));
  }, [statusFilter, selectedFilters, excludeStatuses]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    onTaskUpdate(draggableId, { status: newStatus });
  };

  return (
    <>
      {showHeader && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Bảng Nhiệm Vụ</h1>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nhiệm Vụ Mới
            </Button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={cn(
          "grid gap-4 auto-cols-fr",
          statusFilter === "all" 
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1"
        )}>
          {columnsToShow.map((status) => (
            <Card key={status} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        TASK_STATUS_COLORS[status].split(" ")[0]
                      )}
                    />
                    {TASK_STATUS_LABELS[status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tasksByStatus[status].length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[200px] space-y-2",
                        snapshot.isDraggingOver && "bg-muted/50 rounded-md"
                      )}
                    >
                      {tasksByStatus[status].map((task, index) => {
                        console.log(
                          "Rendering task:",
                          task.title,
                          "status:",
                          task.status
                        );
                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  snapshot.isDragging && "rotate-2 shadow-lg"
                                )}
                              >
                                <TaskCard
                                  task={task}
                                  onClick={() => setSelectedTask(task)}
                                />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(taskId, updates) => {
            onTaskUpdate(taskId, updates);
            setSelectedTask(null);
          }}
        />
      )}

      <TaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(task) => {
          const newTask = {
            ...task,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: TaskStatus.DRAFT,
            assigneeName: user?.name || "Người dùng hiện tại",
          } as Task;
          onTaskCreate(newTask);
          setTasks((prev) => [...prev, newTask]);
          setIsCreateModalOpen(false);
        }}
      />
    </>
  );
}
