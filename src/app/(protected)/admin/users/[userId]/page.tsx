'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Calendar, MapPin, Phone, Briefcase, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { User as UserType } from '@/types/user';
import { Task } from '@/types/task';
import { userService } from '@/services/api/users';
import { tasksService } from '@/services/api/tasks';
import { toast } from 'sonner';

const roleLabels = {
  manager: 'Quản lý',
  employee: 'Nhân viên',
  admin: 'Quản trị viên',
};

const roleColors = {
  manager: 'bg-blue-100 text-blue-800',
  employee: 'bg-green-100 text-green-800',
  admin: 'bg-red-100 text-red-800',
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;

  const [user, setUser] = useState<UserType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserData();
      loadUserTasks();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTasks = async () => {
    try {
      setLoadingTasks(true);
      const tasksData = await tasksService.getTasksByUser(userId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading user tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy người dùng
          </h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chi tiết người dùng</h1>
            <p className="text-muted-foreground">Thông tin chi tiết và công việc</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cá nhân</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                  {roleLabels[user.role as keyof typeof roleLabels]}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.department}</span>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}

                {user.createdAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Tham gia: {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5" />
                <span>Công việc được giao ({tasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Người dùng này chưa có công việc nào được giao
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2">
                            {task.project && (
                              <span className="text-xs text-blue-600">
                                Dự án: {task.project.name}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Hạn: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: vi })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="outline">
                            {task.status}
                          </Badge>
                          <Badge variant="secondary">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}