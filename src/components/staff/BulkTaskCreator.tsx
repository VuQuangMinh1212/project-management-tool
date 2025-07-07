"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Save, Send, X } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CreateTaskData } from "@/types/task";
import { TaskPriority } from "@/types/task";
import { TASK_PRIORITY_LABELS } from "@/constants/taskStatus";
import { 
  getAvailableWeeksForSubmission,
  getCurrentWeek,
  formatWeekForDisplay 
} from "@/lib/utils/weekUtils";
import { useAuth } from "@/hooks/auth/useAuth";

const singleTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  projectId: z.string().min(1, "Project is required"),
  startDate: z.string().optional(),
  estimatedHours: z.number().min(0.5, "Minimum 0.5 hours").optional(),
});

const bulkTaskSchema = z.object({
  weekSubmittedFor: z.string().min(1, "Week selection is required"),
  tasks: z.array(singleTaskSchema).min(1, "At least one task is required"),
});

type BulkTaskFormData = z.infer<typeof bulkTaskSchema>;

interface BulkTaskCreatorProps {
  open: boolean;
  onClose: () => void;
  onCreateBulk?: (weekSubmittedFor: string, tasks: CreateTaskData[]) => void;
  onSaveBulkDrafts?: (weekSubmittedFor: string, tasks: CreateTaskData[]) => void;
}

export function BulkTaskCreator({
  open,
  onClose,
  onCreateBulk,
  onSaveBulkDrafts,
}: BulkTaskCreatorProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableWeeks = getAvailableWeeksForSubmission();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BulkTaskFormData>({
    resolver: zodResolver(bulkTaskSchema),
    defaultValues: {
      weekSubmittedFor: getCurrentWeek(),
      tasks: [
        {
          title: "",
          description: "",
          priority: TaskPriority.MEDIUM,
          projectId: "",
          startDate: "",
          estimatedHours: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const watchedWeek = watch("weekSubmittedFor");

  const addTask = () => {
    append({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      projectId: "",
      startDate: "",
      estimatedHours: undefined,
    });
  };

  const removeTask = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmitDrafts = async (data: BulkTaskFormData) => {
    if (!user || !onSaveBulkDrafts) return;
    
    setIsSubmitting(true);
    try {
      const tasksData: CreateTaskData[] = data.tasks.map(task => ({
        ...task,
        dueDate: task.startDate,
        assigneeId: user.id,
        weekSubmittedFor: data.weekSubmittedFor,
        isDraft: true,
      }));
      
      await onSaveBulkDrafts(data.weekSubmittedFor, tasksData);
      onClose();
      reset();
    } catch (error) {
      console.error("Error saving bulk drafts:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitForApproval = async (data: BulkTaskFormData) => {
    if (!user || !onCreateBulk) return;
    
    setIsSubmitting(true);
    try {
      const tasksData: CreateTaskData[] = data.tasks.map(task => ({
        ...task,
        dueDate: task.startDate,
        assigneeId: user.id,
        weekSubmittedFor: data.weekSubmittedFor,
        isDraft: false,
      }));
      
      await onCreateBulk(data.weekSubmittedFor, tasksData);
      onClose();
      reset();
    } catch (error) {
      console.error("Error submitting bulk tasks:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Tạo Nhiều Nhiệm Vụ</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Week Selection */}
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

          {/* Task List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Nhiệm Vụ ({fields.length})</h3>
              <Button type="button" onClick={addTask} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Nhiệm Vụ
              </Button>
            </div>

            <div className="grid gap-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>Nhiệm Vụ {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Task Title */}
                    <div className="space-y-2">
                      <Label htmlFor={`tasks.${index}.title`}>Tiêu Đề</Label>
                      <Input
                        {...register(`tasks.${index}.title`)}
                        placeholder="Nhập tiêu đề nhiệm vụ"
                      />
                      {errors.tasks?.[index]?.title && (
                        <p className="text-sm text-red-600">
                          {errors.tasks[index]?.title?.message}
                        </p>
                      )}
                    </div>

                    {/* Task Description */}
                    <div className="space-y-2">
                      <Label htmlFor={`tasks.${index}.description`}>Mô Tả</Label>
                      <Textarea
                        {...register(`tasks.${index}.description`)}
                        placeholder="Nhập mô tả nhiệm vụ"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Priority */}
                      <div className="space-y-2">
                        <Label>Mức Độ Ưu Tiên</Label>
                        <Select
                          value={watch(`tasks.${index}.priority`)}
                          onValueChange={(value) =>
                            setValue(`tasks.${index}.priority`, value as TaskPriority)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                      {/* Project */}
                      <div className="space-y-2">
                        <Label>Dự Án</Label>
                        <Select
                          value={watch(`tasks.${index}.projectId`)}
                          onValueChange={(value) =>
                            setValue(`tasks.${index}.projectId`, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn dự án" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="project1">Project Alpha</SelectItem>
                            <SelectItem value="project2">Project Beta</SelectItem>
                            <SelectItem value="project3">Project Gamma</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.tasks?.[index]?.projectId && (
                          <p className="text-sm text-red-600">
                            {errors.tasks[index]?.projectId?.message}
                          </p>
                        )}
                      </div>

                      {/* Start Date */}
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          {...register(`tasks.${index}.startDate`)}
                        />
                        {errors.tasks?.[index]?.startDate && (
                          <p className="text-sm text-red-600">
                            {errors.tasks[index]?.startDate?.message}
                          </p>
                        )}
                      </div>

                      {/* Estimated Hours */}
                      <div className="space-y-2">
                        <Label>Estimated Hours</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0.5"
                          {...register(`tasks.${index}.estimatedHours`, {
                            valueAsNumber: true,
                          })}
                          placeholder="2.5"
                        />
                        {errors.tasks?.[index]?.estimatedHours && (
                          <p className="text-sm text-red-600">
                            {errors.tasks[index]?.estimatedHours?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(onSubmitDrafts)}
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu Tất Cả Làm Bản Nháp
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmitForApproval)}
              disabled={isSubmitting}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Gửi Tất Cả Để Phê Duyệt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
