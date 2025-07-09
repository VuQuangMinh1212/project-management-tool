"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  X,
  Save,
  Send,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Task, UpdateTaskData, CreateTaskData } from "@/types/task";
import { TaskStatus, TaskPriority } from "@/types/task";
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
} from "@/constants/taskStatus";
import { 
  canCreateTasksForNextWeek, 
  canModifyTasksForWeek, 
  getAvailableWeeksForSubmission,
  getCurrentWeek,
  formatWeekForDisplay 
} from "@/lib/utils/weekUtils";
import { useAuth } from "@/hooks/auth/useAuth";

const taskSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  projectId: z.string().min(1, "Dự án là bắt buộc"),
  startDate: z.string().optional(),
  estimatedHours: z.number().min(0.5, "Tối thiểu 0.5 giờ").optional(),
  weekSubmittedFor: z.string().min(1, "Chọn tuần là bắt buộc"),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  task?: Task;
  open: boolean;
  onClose: () => void;
  onUpdate?: (taskId: string, updates: UpdateTaskData) => void;
  onCreate?: (taskData: CreateTaskData) => void;
  onSaveDraft?: (taskData: CreateTaskData) => void;
  userRole?: "employee" | "manager";
}

export function TaskModal({
  task,
  open,
  onClose,
  onUpdate,
  onCreate,
  onSaveDraft,
  userRole = "employee",
}: TaskModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "">("");
  const isEditing = !!task;
  const isManager = userRole === "manager";
  
  const isApprovedTaskForStaff = !isManager && task && 
    (task.status === TaskStatus.TODO || 
     task.status === TaskStatus.IN_PROGRESS || 
     task.status === TaskStatus.DONE ||
     task.status === TaskStatus.FINISHED ||
     task.status === TaskStatus.DELAYED ||
     task.status === TaskStatus.CANCELLED ||
     task.status === TaskStatus.OVERDUE);
  
  const canEdit = () => {
    if (!task) return true;
    if (isManager) return true;
    
    if (task.status === TaskStatus.DRAFT) return true;
    if (task.status === TaskStatus.REJECTED) return true;
    if (task.status === TaskStatus.PENDING_APPROVAL) return false;
    
    if (isApprovedTaskForStaff) return false;
    
    return false;
  };

  const canUpdateStatus = () => {
    if (!task) return false;
    if (isManager) return true;
    
    return isApprovedTaskForStaff;
  };

  const getAvailableStatuses = () => {
    if (!task) return [];
    if (isManager) {
      if (task.status === TaskStatus.PENDING_APPROVAL) {
        return [TaskStatus.IN_PROGRESS, TaskStatus.REJECTED];
      }
      return Object.values(TaskStatus);
    }
    
    switch (task.status) {
      case TaskStatus.TODO:
        return [TaskStatus.TODO, TaskStatus.IN_PROGRESS];
      case TaskStatus.IN_PROGRESS:
        return [TaskStatus.IN_PROGRESS, TaskStatus.FINISHED, TaskStatus.DELAYED, TaskStatus.CANCELLED];
      case TaskStatus.OVERDUE:
        return [TaskStatus.OVERDUE, TaskStatus.IN_PROGRESS, TaskStatus.FINISHED, TaskStatus.DELAYED, TaskStatus.CANCELLED];
      case TaskStatus.FINISHED:
      case TaskStatus.DELAYED:
      case TaskStatus.CANCELLED:
      case TaskStatus.DONE:
        return [task.status];
      default:
        return [];
    }
  };

  const availableWeeks = getAvailableWeeksForSubmission();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || "",
          priority: task.priority,
          projectId: task.projectId || "",
          startDate: task.dueDate
            ? format(new Date(task.dueDate), "yyyy-MM-dd")
            : "",
          estimatedHours: task.estimatedHours,
          weekSubmittedFor: task.weekSubmittedFor || getCurrentWeek(),
        }
      : {
          priority: TaskPriority.MEDIUM,
          weekSubmittedFor: getCurrentWeek(),
        },
  });

  const watchedWeek = watch("weekSubmittedFor");

  useEffect(() => {
    if (open && !isEditing) {
      reset({
        priority: TaskPriority.MEDIUM,
        weekSubmittedFor: getCurrentWeek(),
      });
    }
    
    // Reset status selection when modal opens
    if (open) {
      setSelectedStatus("");
      setStatusNote("");
    }
  }, [open, isEditing, reset]);

  const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && onUpdate) {
        const updates: UpdateTaskData = {
          title: data.title,
          description: data.description,
          priority: data.priority,
          projectId: data.projectId,
          dueDate: data.startDate,
          estimatedHours: data.estimatedHours,
        };
        await onUpdate(task.id, updates);
      } else if (onCreate) {
        const taskData: CreateTaskData = {
          ...data,
          dueDate: data.startDate,
          assigneeId: user.id,
          isDraft: false,
        };
        await onCreate(taskData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !onSaveDraft) return;
    
    const formData = watch();
    setIsSubmitting(true);
    
    try {
      const taskData: CreateTaskData = {
        ...formData,
        assigneeId: user.id,
        isDraft: true,
      };
      await onSaveDraft(taskData);
      onClose();
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    if (!task || !onUpdate) return;
    
    setIsSubmitting(true);
    try {
      const updates: UpdateTaskData = {
        status: newStatus,
      };
      
      // Add status note if provided
      if (statusNote.trim()) {
        updates.statusNote = statusNote.trim();
      }
      
      // Manager review comment
      if (newComment.trim() && isManager) {
        updates.reviewComment = newComment.trim();
      }
      
      await onUpdate(task.id, updates);
      setNewComment("");
      setStatusNote("");
      setSelectedStatus("");
      onClose();
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== task?.status) {
      handleStatusUpdate(selectedStatus as TaskStatus);
    }
  };

  const canSubmitForWeek = watchedWeek ? canModifyTasksForWeek(watchedWeek) : false;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&_button[data-radix-dialog-close]]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {isApprovedTaskForStaff ? "Cập Nhật Trạng Thái Nhiệm Vụ" : 
               isEditing ? "Chỉnh Sửa Nhiệm Vụ" : "Tạo Nhiệm Vụ Mới"}
              {task && (
                <Badge 
                  className={`ml-2 ${TASK_STATUS_COLORS[task.status]}`}
                  variant="secondary"
                >
                  {TASK_STATUS_LABELS[task.status]}
                </Badge>
              )}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Simplified interface for approved tasks */}
        {isApprovedTaskForStaff ? (
          <div className="space-y-6">
            {/* Task Info Display */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Mức Độ Ưu Tiên: {TASK_PRIORITY_LABELS[task.priority]}</span>
                {task.projectName && <span>Dự án: {task.projectName}</span>}
                {task.estimatedHours && <span>Ước tính Giờ: {task.estimatedHours}</span>}
              </div>
            </div>

            {/* Status Update Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statusUpdate">Cập Nhật Trạng Thái</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as TaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái mới" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatuses().map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            status === TaskStatus.TODO ? 'bg-blue-500' :
                            status === TaskStatus.IN_PROGRESS ? 'bg-purple-500' :
                            status === TaskStatus.DONE ? 'bg-green-500' :
                            status === TaskStatus.FINISHED ? 'bg-green-600' :
                            status === TaskStatus.DELAYED ? 'bg-orange-500' :
                            status === TaskStatus.CANCELLED ? 'bg-red-500' :
                            status === TaskStatus.OVERDUE ? 'bg-red-600' :
                            'bg-gray-500'
                          }`} />
                          <span>{TASK_STATUS_LABELS[status]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Note */}
              <div className="space-y-2">
                <Label htmlFor="statusNote">Thêm Ghi Chú Tiến Độ (Tùy chọn)</Label>
                <Textarea
                  id="statusNote"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Thêm cập nhật, rào cản hoặc ghi chú về tiến độ của bạn..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Ghi chú này sẽ hiển thị cho quản lý và giúp theo dõi tiến độ.
                </p>
              </div>
            </div>

            {/* Review Comments Display */}
            {task?.reviewComment && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Nhận Xét Của Quản Lý</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 mt-1 text-blue-600" />
                      <p className="text-sm text-blue-900">{task.reviewComment}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              
              <Button 
                onClick={handleQuickStatusUpdate}
                disabled={isSubmitting || !selectedStatus || selectedStatus === task.status}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập Nhật Trạng Thái"}
              </Button>
            </div>
          </div>
        ) : (
          /* Full task form for other cases */
          <>
            {/* Workflow Information for new tasks */}
            {!isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-blue-900">Tùy Chọn Tạo Nhiệm Vụ</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p><strong>Lưu Bản Nháp:</strong> Lưu nhiệm vụ để hoàn thiện sau. Bạn có thể tạo nhiều bản nháp và gửi cùng lúc.</p>
                      <p><strong>Gửi Phê Duyệt:</strong> Gửi nhiệm vụ trực tiếp cho quản lý để xem xét và phê duyệt.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Week Selection */}
          {(!isEditing || task?.status === TaskStatus.DRAFT) && (
            <div className="space-y-2">
              <Label htmlFor="weekSubmittedFor">Tuần Mục Tiêu</Label>
              <Select
                value={watchedWeek}
                onValueChange={(value) => setValue("weekSubmittedFor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tuần" />
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks.map((week) => (
                    <SelectItem key={week.value} value={week.value}>
                      {week.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.weekSubmittedFor && (
                <p className="text-sm text-red-600">{errors.weekSubmittedFor.message}</p>
              )}
            </div>
          )}

          {/* Submission period warning */}
          {!canSubmitForWeek && watchedWeek && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Thời gian nộp cho {formatWeekForDisplay(watchedWeek)} đã kết thúc.
              </AlertDescription>
            </Alert>
          )}

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu Đề Nhiệm Vụ</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Nhập tiêu đề nhiệm vụ"
              disabled={!canEdit()}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô Tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Nhập mô tả nhiệm vụ"
              rows={3}
              disabled={!canEdit()}
            />
          </div>

          {/* Priority and Project */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Mức Độ Ưu Tiên</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value as TaskPriority)}
                disabled={!canEdit()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {TASK_PRIORITY_LABELS[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Dự Án</Label>
              <Select
                value={watch("projectId")}
                onValueChange={(value) => setValue("projectId", value)}
                disabled={!canEdit()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dự án" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-1">Website Redesign</SelectItem>
                  <SelectItem value="project-2">Mobile App</SelectItem>
                  <SelectItem value="project-3">API Integration</SelectItem>
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-sm text-red-600">{errors.projectId.message}</p>
              )}
            </div>
          </div>

          {/* Start Date and Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày Bắt Đầu</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                disabled={!canEdit()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Ước Tính Giờ</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0.5"
                {...register("estimatedHours", { valueAsNumber: true })}
                placeholder="e.g. 4.5"
                disabled={!canEdit()}
              />
              {errors.estimatedHours && (
                <p className="text-sm text-red-600">{errors.estimatedHours.message}</p>
              )}
            </div>
          </div>

          {/* Review Comments Display */}
          {task?.reviewComment && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Nhận Xét Của Quản Lý</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 mt-1 text-gray-500" />
                    <p className="text-sm">{task.reviewComment}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            
            <div className="flex gap-2">
              {/* Save as Draft */}
              {(!isEditing || task?.status === TaskStatus.DRAFT) && onSaveDraft && canSubmitForWeek && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Lưu Bản Nháp
                </Button>
              )}
              
              {/* Submit Button */}
              {canEdit() && canSubmitForWeek && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Đang lưu..."
                  ) : isEditing ? (
                    "Cập Nhật Nhiệm Vụ"
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Gửi Phê Duyệt
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
