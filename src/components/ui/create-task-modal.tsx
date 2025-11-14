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
import { format, addWeeks, nextFriday, startOfWeek, addDays, getISOWeek, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { tasksService } from '@/services/api/tasks';
import { userService } from '@/services/api/users';
import { projectsService } from '@/services/api/projects';
import { User } from '@/types/auth';
import { Project } from '@/types/project';
import { CreateTaskData } from '@/types/task';
import { toast } from 'sonner';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  assigneeIds: z.array(z.string()).min(1, 'Phải chọn ít nhất một người thực hiện'),
  projectId: z.string().min(1, 'Phải chọn dự án'),
  priority: z.string().min(1, 'Phải chọn độ ưu tiên'),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
  isDraft: z.boolean().optional().default(false),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<User[]>([]);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const getNextFriday = () => {
    const today = new Date();
    const friday = nextFriday(addWeeks(today, 1));
    return friday;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      isDraft: false,
      priority: 'low',
      dueDate: getNextFriday(),
    },
  });

  const watchedDate = watch('dueDate');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    setValue('assigneeIds', selectedEmployees.map(emp => emp.id));
  }, [selectedEmployees, setValue]);

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

  const handleEmployeeSelect = (employee: User) => {
    const isSelected = selectedEmployees.find(emp => emp.id === employee.id);
    if (isSelected) {
      setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employee.id));
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const removeEmployee = (employeeId: string) => {
    setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== employeeId));
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    setLoading(true);
    try {
      const taskData: CreateTaskData = {
        title: data.title,
        description: data.description,
        assigneeIds: data.assigneeIds,
        projectId: data.projectId,
        priority: data.priority,
        dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
        estimatedHours: data.estimatedHours,
        isDraft: data.isDraft,
      };

      await tasksService.createTask(taskData);
      toast.success('Tạo công việc thành công');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Không thể tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEmployees([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo công việc mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo công việc mới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dự án *</Label>
              <Select onValueChange={(value) => setValue('projectId', value)}>
                <SelectTrigger className={errors.projectId ? 'border-red-500' : ''}>
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
              {errors.projectId && (
                <p className="text-sm text-red-500">{errors.projectId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Độ ưu tiên *</Label>
              <Select onValueChange={(value) => setValue('priority', value)} defaultValue="low">
                <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
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
          </div>

          <div className="space-y-2">
            <Label>Người thực hiện *</Label>
            <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={employeeSearchOpen}
                  className={cn(
                    "w-full justify-between",
                    errors.assigneeIds && "border-red-500"
                  )}
                >
                  {selectedEmployees.length > 0
                    ? `Đã chọn ${selectedEmployees.length} người`
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
                        const isSelected = selectedEmployees.find(emp => emp.id === employee.id);
                        return (
                          <CommandItem
                            key={employee.id}
                            onSelect={() => handleEmployeeSelect(employee)}
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
            
            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedEmployees.map((employee) => (
                  <Badge key={employee.id} variant="secondary" className="flex items-center gap-1">
                    {employee.fullName}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeEmployee(employee.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {errors.assigneeIds && (
              <p className="text-sm text-red-500">{errors.assigneeIds.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hạn chót</Label>
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
                      setValue('dueDate', date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Thời gian ước tính (giờ)</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                {...register('estimatedHours', { valueAsNumber: true })}
              />
            </div>
          </div>

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
                'Tạo công việc'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}