'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown, X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { tasksService } from '@/services/api/tasks';
import { userService } from '@/services/api/users';
import { projectsService } from '@/services/api/projects';
import { User } from '@/types/auth';
import { Project } from '@/types/project';
import { CreateTaskData } from '@/types/task';
import { toast } from 'sonner';

const taskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  assigneeIds: z.array(z.string()).min(1, 'Phải chọn ít nhất một người thực hiện'),
  projectId: z.string().min(1, 'Phải chọn dự án'),
  priority: z.string().min(1, 'Phải chọn độ ưu tiên'),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
  weekSubmittedFor: z.string().optional(),
  isDraft: z.boolean().default(false),
});

const bulkTaskSchema = z.object({
  tasks: z.array(taskSchema).min(1, 'Phải có ít nhất một công việc'),
});

type BulkTaskFormData = z.infer<typeof bulkTaskSchema>;

interface CreateTaskBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTaskBulkModal({ isOpen, onClose, onSuccess }: CreateTaskBulkModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<{ [taskIndex: number]: User[] }>({});
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState<{ [taskIndex: number]: boolean }>({});
  const [datePickerOpen, setDatePickerOpen] = useState<{ [taskIndex: number]: boolean }>({});

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BulkTaskFormData>({
    resolver: zodResolver(bulkTaskSchema),
    defaultValues: {
      tasks: [
        {
          title: '',
          description: '',
          assigneeIds: [],
          projectId: '',
          priority: '',
          isDraft: false,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [employeesData, projectsData] = await Promise.all([
        userService.getUsers('employee'),
        projectsService.getProjects(),
      ]);
      setEmployees(employeesData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const handleEmployeeSelect = (taskIndex: number, employee: User) => {
    const currentSelected = selectedEmployees[taskIndex] || [];
    const isSelected = currentSelected.find(emp => emp.id === employee.id);
    
    if (isSelected) {
      const updated = currentSelected.filter(emp => emp.id !== employee.id);
      setSelectedEmployees({ ...selectedEmployees, [taskIndex]: updated });
      setValue(`tasks.${taskIndex}.assigneeIds`, updated.map(emp => emp.id));
    } else {
      const updated = [...currentSelected, employee];
      setSelectedEmployees({ ...selectedEmployees, [taskIndex]: updated });
      setValue(`tasks.${taskIndex}.assigneeIds`, updated.map(emp => emp.id));
    }
  };

  const removeEmployee = (taskIndex: number, employeeId: string) => {
    const currentSelected = selectedEmployees[taskIndex] || [];
    const updated = currentSelected.filter(emp => emp.id !== employeeId);
    setSelectedEmployees({ ...selectedEmployees, [taskIndex]: updated });
    setValue(`tasks.${taskIndex}.assigneeIds`, updated.map(emp => emp.id));
  };

  const addTask = () => {
    append({
      title: '',
      description: '',
      assigneeIds: [],
      projectId: '',
      priority: '',
      isDraft: false,
    });
  };

  const removeTask = (index: number) => {
    remove(index);
    const newSelectedEmployees = { ...selectedEmployees };
    delete newSelectedEmployees[index];
    setSelectedEmployees(newSelectedEmployees);
  };

  const onSubmit = async (data: BulkTaskFormData) => {
    setLoading(true);
    try {
      const tasksData: CreateTaskData[] = data.tasks.map(task => ({
        title: task.title,
        description: task.description,
        assigneeIds: task.assigneeIds,
        projectId: task.projectId,
        priority: task.priority,
        dueDate: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : undefined,
        estimatedHours: task.estimatedHours,
        weekSubmittedFor: task.weekSubmittedFor,
        isDraft: task.isDraft || false,
      }));

      await tasksService.createTasksBulk({ tasks: tasksData });
      toast.success(`Tạo thành công ${tasksData.length} công việc`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating tasks:', error);
      toast.error('Không thể tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEmployees({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo nhiều công việc</DialogTitle>
          <DialogDescription>
            Tạo nhiều công việc cùng lúc
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, taskIndex) => {
            const currentEmployees = selectedEmployees[taskIndex] || [];
            const watchedDate = watch(`tasks.${taskIndex}.dueDate`);

            return (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Công việc #{taskIndex + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTask(taskIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tiêu đề *</Label>
                  <Input
                    {...register(`tasks.${taskIndex}.title`)}
                    className={errors.tasks?.[taskIndex]?.title ? 'border-red-500' : ''}
                  />
                  {errors.tasks?.[taskIndex]?.title && (
                    <p className="text-sm text-red-500">{errors.tasks[taskIndex]?.title?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    {...register(`tasks.${taskIndex}.description`)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dự án *</Label>
                    <Select onValueChange={(value) => setValue(`tasks.${taskIndex}.projectId`, value)}>
                      <SelectTrigger className={errors.tasks?.[taskIndex]?.projectId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Chọn dự án" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tasks?.[taskIndex]?.projectId && (
                      <p className="text-sm text-red-500">{errors.tasks[taskIndex]?.projectId?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Độ ưu tiên *</Label>
                    <Select onValueChange={(value) => setValue(`tasks.${taskIndex}.priority`, value)}>
                      <SelectTrigger className={errors.tasks?.[taskIndex]?.priority ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Chọn độ ưu tiên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tasks?.[taskIndex]?.priority && (
                      <p className="text-sm text-red-500">{errors.tasks[taskIndex]?.priority?.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Người thực hiện *</Label>
                  <Popover
                    open={employeeSearchOpen[taskIndex] || false}
                    onOpenChange={(open) => setEmployeeSearchOpen({ ...employeeSearchOpen, [taskIndex]: open })}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          errors.tasks?.[taskIndex]?.assigneeIds && "border-red-500"
                        )}
                      >
                        {currentEmployees.length > 0
                          ? `Đã chọn ${currentEmployees.length} người`
                          : "Chọn người thực hiện"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm nhân viên..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                          <CommandGroup>
                            {employees.map((employee) => {
                              const isSelected = currentEmployees.find(emp => emp.id === employee.id);
                              return (
                                <CommandItem
                                  key={employee.id}
                                  onSelect={() => handleEmployeeSelect(taskIndex, employee)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <div className="font-medium">{employee.fullName}</div>
                                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {currentEmployees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentEmployees.map((employee) => (
                        <Badge key={employee.id} variant="secondary" className="flex items-center gap-1">
                          {employee.fullName}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeEmployee(taskIndex, employee.id)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.tasks?.[taskIndex]?.assigneeIds && (
                    <p className="text-sm text-red-500">{errors.tasks[taskIndex]?.assigneeIds?.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Hạn chót</Label>
                    <Popover
                      open={datePickerOpen[taskIndex] || false}
                      onOpenChange={(open) => setDatePickerOpen({ ...datePickerOpen, [taskIndex]: open })}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchedDate ? (
                            format(watchedDate, 'dd/MM/yyyy', { locale: vi })
                          ) : (
                            "Chọn ngày"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={watchedDate}
                          onSelect={(date) => {
                            setValue(`tasks.${taskIndex}.dueDate`, date);
                            setDatePickerOpen({ ...datePickerOpen, [taskIndex]: false });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Thời gian ước tính (giờ)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      {...register(`tasks.${taskIndex}.estimatedHours`, { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tuần nộp</Label>
                    <Input
                      placeholder="VD: 2025-W02"
                      {...register(`tasks.${taskIndex}.weekSubmittedFor`)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={addTask}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm công việc
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                `Tạo ${fields.length} công việc`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}