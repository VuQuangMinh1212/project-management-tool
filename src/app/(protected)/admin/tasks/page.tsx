'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Eye } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { User } from '@/types/user';
import { Project } from '@/types/project';
import { tasksService } from '@/services/api/tasks';
import { userService } from '@/services/api/users';
import { projectsService } from '@/services/api/projects';
import CreateTaskModal from '@/components/ui/create-task-modal';
import CreateTaskBulkModal from '@/components/ui/create-task-bulk-modal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TaskFilters {
  assigneeId?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  isDraft?: boolean;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load tasks when filters change
  useEffect(() => {
    loadTasks();
  }, [filters, searchQuery]);

  const loadData = async () => {
    try {
      const [usersData, projectsData] = await Promise.all([
        userService.getUsers(),
        projectsService.getProjects(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const queryParams = {
        ...filters,
        search: searchQuery || undefined,
      };
      
      const tasksData = await tasksService.getTasks(queryParams);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
      [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [TaskStatus.REVIEW]: 'bg-yellow-100 text-yellow-800',
      [TaskStatus.DONE]: 'bg-green-100 text-green-800',
      [TaskStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      [TaskPriority.LOW]: 'bg-gray-100 text-gray-600',
      [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-700',
      [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
      [TaskPriority.URGENT]: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý công việc</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả công việc trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo công việc mới
          </Button>
          <Button variant="outline" onClick={() => setShowBulkCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo nhiều công việc
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm công việc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Người thực hiện</Label>
                  <Select
                    value={filters.assigneeId || ''}
                    onValueChange={(value) =>
                      setFilters({ ...filters, assigneeId: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người thực hiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dự án</Label>
                  <Select
                    value={filters.projectId || ''}
                    onValueChange={(value) =>
                      setFilters({ ...filters, projectId: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dự án" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value as TaskStatus || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value={TaskStatus.TODO}>Chờ thực hiện</SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>Đang thực hiện</SelectItem>
                      <SelectItem value={TaskStatus.REVIEW}>Chờ duyệt</SelectItem>
                      <SelectItem value={TaskStatus.DONE}>Hoàn thành</SelectItem>
                      <SelectItem value={TaskStatus.CANCELLED}>Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Độ ưu tiên</Label>
                  <Select
                    value={filters.priority || ''}
                    onValueChange={(value) =>
                      setFilters({ ...filters, priority: value as TaskPriority || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value={TaskPriority.LOW}>Thấp</SelectItem>
                      <SelectItem value={TaskPriority.MEDIUM}>Trung bình</SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>Cao</SelectItem>
                      <SelectItem value={TaskPriority.URGENT}>Khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div>Đang tải...</div>
            </CardContent>
          </Card>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">Không có công việc nào</div>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status === TaskStatus.TODO && 'Chờ thực hiện'}
                        {task.status === TaskStatus.IN_PROGRESS && 'Đang thực hiện'}
                        {task.status === TaskStatus.REVIEW && 'Chờ duyệt'}
                        {task.status === TaskStatus.DONE && 'Hoàn thành'}
                        {task.status === TaskStatus.CANCELLED && 'Đã hủy'}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority === TaskPriority.LOW && 'Thấp'}
                        {task.priority === TaskPriority.MEDIUM && 'Trung bình'}
                        {task.priority === TaskPriority.HIGH && 'Cao'}
                        {task.priority === TaskPriority.URGENT && 'Khẩn cấp'}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {task.project && (
                        <span>Dự án: {task.project.name}</span>
                      )}
                      {task.assignee && (
                        <span>Người thực hiện: {task.assignee.fullName}</span>
                      )}
                      {task.dueDate && (
                        <span>
                          Hạn chót: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                      )}
                      {task.createdAt && (
                        <span>
                          Tạo lúc: {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => loadTasks()}
      />

      <CreateTaskBulkModal
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
        onSuccess={() => loadTasks()}
      />
    </div>
  );
}