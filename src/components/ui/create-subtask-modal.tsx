'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { tasksService } from '@/services/api/tasks';
import { userService } from '@/services/api/users';
import { User } from '@/types/auth';
import { CreateTaskData, Task } from '@/types/task';
import { toast } from 'sonner';

const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  assigneeIds: z.array(z.string()).min(1, 'Phải chọn ít nhất một người thực hiện'),
  priority: z.string().min(1, 'Phải chọn độ ưu tiên'),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
});

type CreateSubtaskFormData = z.infer<typeof createSubtaskSchema>;

interface CreateSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  parentTask: Task;
}

export default function CreateSubtaskModal({ isOpen, onClose, onSuccess, parentTask }: CreateSubtaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<User[]>([]);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateSubtaskFormData>({
    resolver: zodResolver(createSubtaskSchema),
  });

  const watchedDate = watch('dueDate');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const data = await userService.getUsers('employee');
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleEmployeeSelect = (employee: User) => {
    const isSelected = selectedEmployees.some(e => e.id === employee.id);
    let newSelected: User[];
    
    if (isSelected) {
      newSelected = selectedEmployees.filter(e => e.id !== employee.id);
    } else {
      newSelected = [...selectedEmployees, employee];
    }
    
    setSelectedEmployees(newSelected);
    setValue('assigneeIds', newSelected.map(e => e.id), { shouldValidate: true });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    const newSelected = selectedEmployees.filter(e => e.id !== employeeId);
    setSelectedEmployees(newSelected);
    setValue('assigneeIds', newSelected.map(e => e.id), { shouldValidate: true });
  };

  const onSubmit = async (data: CreateSubtaskFormData) => {
    try {
      setLoading(true);

      const taskData: CreateTaskData = {
        title: data.title,
        description: data.description,
        assigneeIds: data.assigneeIds,
        projectId: parentTask.projectId,
        priority: data.priority,
        dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
        estimatedHours: data.estimatedHours,
        weekSubmittedFor: parentTask.weekSubmittedFor,
        isDraft: false,
        parentTaskId: parentTask.id,
      };

      await tasksService.createTask(taskData);
      toast.success('Tạo task con thành công!');
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating subtask:', error);
      toast.error(error?.response?.data?.message || 'Không thể tạo task con');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEmployees([]);
    setEmployeeSearchOpen(false);
    setDatePickerOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo task con</DialogTitle>
          <DialogDescription>
            Tạo task con cho: {parentTask.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề task con"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả chi tiết"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label>Người thực hiện *</Label>
            <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={employeeSearchOpen}
                  className="w-full justify-between"
                >
                  {selectedEmployees.length === 0
                    ? "Chọn người thực hiện..."
                    : `Đã chọn ${selectedEmployees.length} người`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Tìm kiếm nhân viên..." />
                  <CommandEmpty>Không tìm thấy nhân viên</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {employees.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          onSelect={() => handleEmployeeSelect(employee)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedEmployees.some(e => e.id === employee.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{employee.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              {employee.email}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedEmployees.map((employee) => (
                  <Badge key={employee.id} variant="secondary" className="pl-2 pr-1">
                    {employee.fullName}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployee(employee.id)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.assigneeIds && (
              <p className="text-sm text-red-500">{errors.assigneeIds.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Độ ưu tiên *</Label>
              <Select onValueChange={(value) => setValue('priority', value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Giờ ước tính</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                {...register('estimatedHours', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ngày hết hạn</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
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
                    format(watchedDate, "dd/MM/yyyy", { locale: vi })
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watchedDate}
                  onSelect={(date) => {
                    setValue('dueDate', date);
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo task con'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
