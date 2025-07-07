"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Send, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Task } from "@/types/task";
import { TaskStatus } from "@/types/task";
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
} from "@/constants/taskStatus";
import { 
  formatWeekForDisplay, 
  canModifyTasksForWeek,
  getCurrentWeek
} from "@/lib/utils/weekUtils";

interface DraftTaskManagerProps {
  draftTasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSubmitBatch: (taskIds: string[], weekSubmittedFor: string) => void;
}

export function DraftTaskManager({
  draftTasks,
  onEditTask,
  onDeleteTask,
  onSubmitBatch,
}: DraftTaskManagerProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group draft tasks by week
  const tasksByWeek = draftTasks.reduce((acc, task) => {
    const week = task.weekSubmittedFor || getCurrentWeek();
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleTaskSelect = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAllForWeek = (tasks: Task[], checked: boolean) => {
    const taskIds = tasks.map(t => t.id);
    if (checked) {
      setSelectedTasks(prev => {
        const newSet = new Set([...prev, ...taskIds]);
        return Array.from(newSet);
      });
    } else {
      setSelectedTasks(prev => prev.filter(id => !taskIds.includes(id)));
    }
  };

  const handleSubmitSelected = async () => {
    if (selectedTasks.length === 0) return;

    setIsSubmitting(true);
    try {
      // Get the week from the first selected task
      const firstTask = draftTasks.find(t => t.id === selectedTasks[0]);
      const week = firstTask?.weekSubmittedFor || getCurrentWeek();
      
      await onSubmitBatch(selectedTasks, week);
      setSelectedTasks([]);
      setIsSubmitDialogOpen(false);
    } catch (error) {
      console.error("Error submitting tasks:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedTasksForWeek = (week: string) => {
    const weekTasks = tasksByWeek[week] || [];
    return weekTasks.filter(task => selectedTasks.includes(task.id));
  };

  if (draftTasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Không có bản nháp</h3>
              <p className="text-gray-500 mt-1">
                Sử dụng nút "Nhiệm Vụ Mới" hoặc "Tạo Nhiều Nhiệm Vụ" ở trên để bắt đầu lập kế hoạch tuần của bạn.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bản Nháp</h2>
          <p className="text-gray-600">
            Tạo và sắp xếp nhiệm vụ trước khi gửi phê duyệt.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedTasks.length > 0 && (
            <Button onClick={() => setIsSubmitDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Gửi Đã Chọn ({selectedTasks.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tasks grouped by week */}
      {Object.entries(tasksByWeek).map(([week, tasks]) => {
        const canSubmit = canModifyTasksForWeek(week);
        const selectedInWeek = getSelectedTasksForWeek(week);
        const allSelected = selectedInWeek.length === tasks.length;
        const someSelected = selectedInWeek.length > 0;

        return (
          <Card key={week}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {formatWeekForDisplay(week)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {tasks.length} bản nháp
                    </p>
                  </div>
                  {!canSubmit && (
                    <Badge variant="destructive">
                      Đã đóng thời gian nộp
                    </Badge>
                  )}
                </div>
                
                {canSubmit && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={(e) => handleSelectAllForWeek(tasks, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Chọn tất cả</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {!canSubmit && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The submission period for this week has ended. You can only view and delete these tasks.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      {canSubmit && (
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => handleTaskSelect(task.id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{task.title}</h4>
                          <Badge 
                            variant="secondary"
                            className={TASK_STATUS_COLORS[task.status]}
                          >
                            {TASK_STATUS_LABELS[task.status]}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Priority: {TASK_PRIORITY_LABELS[task.priority]}</span>
                          {task.estimatedHours && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimatedHours}h
                            </span>
                          )}
                          {task.dueDate && (
                            <span>
                              Due: {format(new Date(task.dueDate), "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTask(task)}
                        disabled={!canSubmit}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Submit Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Tasks for Approval</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>
              You are about to submit {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} for manager approval.
            </p>
            
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Once submitted, you won't be able to edit these tasks until they are reviewed by your manager.
              </AlertDescription>
            </Alert>

            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedTasks.map(taskId => {
                const task = draftTasks.find(t => t.id === taskId);
                return task ? (
                  <div key={taskId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{task.title}</span>
                    <Badge variant="outline">
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitSelected} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
