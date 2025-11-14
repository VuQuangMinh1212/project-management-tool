'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tasksService } from '@/services/api/tasks';
import { Task, TaskStatus } from '@/types/task';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_COLORS } from '@/constants/taskStatus';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AdminApprovalsPage() {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasks, statsData] = await Promise.all([
        tasksService.getPendingApprovals(),
        tasksService.getTaskStats(),
      ]);
      setPendingTasks(tasks);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (task: Task) => {
    setSelectedTask(task);
    setActionType('approve');
    setReviewComment('');
  };

  const handleReject = async (task: Task) => {
    setSelectedTask(task);
    setActionType('reject');
    setReviewComment('');
  };

  const submitReview = async () => {
    if (!selectedTask || !actionType) return;

    if (actionType === 'reject' && !reviewComment.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setSubmitting(true);
      if (actionType === 'approve') {
        await tasksService.approveTask(selectedTask.id, reviewComment);
        toast.success('Đã duyệt task thành công');
      } else {
        await tasksService.rejectTask(selectedTask.id, reviewComment);
        toast.success('Đã từ chối task');
      }
      
      setSelectedTask(null);
      setActionType(null);
      setReviewComment('');
      loadData();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.message || 'Không thể xử lý yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedByWeek = pendingTasks.reduce((acc, task) => {
    const week = task.weekSubmittedFor || 'Không xác định';
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const groupedByEmployee = pendingTasks.reduce((acc, task) => {
    const employee = task.assignee?.fullName || 'Không xác định';
    if (!acc[employee]) {
      acc[employee] = [];
    }
    acc[employee].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phê duyệt Tasks - Admin</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và phê duyệt tất cả các công việc trong hệ thống
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Đã duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Từ chối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {pendingTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Không có task nào chờ duyệt</h3>
            <p className="text-gray-600">Tất cả tasks đã được xử lý</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="week" className="space-y-4">
          <TabsList>
            <TabsTrigger value="week">Theo tuần</TabsTrigger>
            <TabsTrigger value="employee">Theo nhân viên</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-4">
            {Object.entries(groupedByWeek).map(([week, tasks]) => (
              <Card key={week}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Tuần {week}
                    <Badge variant="secondary">{tasks.length} tasks</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onApprove={() => handleApprove(task)}
                      onReject={() => handleReject(task)}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="employee" className="space-y-4">
            {Object.entries(groupedByEmployee).map(([employee, tasks]) => (
              <Card key={employee}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {employee}
                    <Badge variant="secondary">{tasks.length} tasks</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onApprove={() => handleApprove(task)}
                      onReject={() => handleReject(task)}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={!!selectedTask && !!actionType} onOpenChange={() => {
        setSelectedTask(null);
        setActionType(null);
        setReviewComment('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Phê duyệt task' : 'Từ chối task'}
            </DialogTitle>
            <DialogDescription>
              {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Nhân viên:</span> {selectedTask?.assignee?.fullName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Tuần:</span> {selectedTask?.weekSubmittedFor}
              </p>
              {selectedTask?.estimatedHours && (
                <p className="text-sm">
                  <span className="font-medium">Giờ ước tính:</span> {selectedTask.estimatedHours}h
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewComment">
                {actionType === 'reject' ? 'Lý do từ chối *' : 'Nhận xét (tùy chọn)'}
              </Label>
              <Textarea
                id="reviewComment"
                placeholder={actionType === 'reject' 
                  ? 'Nhập lý do từ chối...' 
                  : 'Nhập nhận xét của bạn...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTask(null);
                setActionType(null);
                setReviewComment('');
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={submitReview}
              disabled={submitting || (actionType === 'reject' && !reviewComment.trim())}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {submitting ? 'Đang xử lý...' : actionType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskCard({ 
  task, 
  onApprove, 
  onReject 
}: { 
  task: Task; 
  onApprove: () => void; 
  onReject: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge className={TASK_STATUS_COLORS[task.priority]}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
            {task.project && (
              <Badge variant="outline">{task.project.name}</Badge>
            )}
            {task.estimatedHours && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {task.estimatedHours}h
              </Badge>
            )}
          </div>
        </div>
      </div>

      {task.dueDate && (
        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Hạn: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: vi })}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={onApprove}
          className="flex-1"
          variant="default"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Phê duyệt
        </Button>
        <Button
          onClick={onReject}
          className="flex-1"
          variant="destructive"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Từ chối
        </Button>
      </div>
    </div>
  );
}
