'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, FileText, Calendar, Clock, FolderOpen } from 'lucide-react'
import { format } from 'date-fns'
import { Task } from '@/types/task'
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from '@/constants/taskStatus'
import { tasksService } from '@/services'
import { useModernToast } from '@/components/ui/modern-toast-provider'
import UserDetailModal from '@/components/ui/user-detail-modal'

interface ViewTaskModalProps {
  isOpen: boolean
  taskId: string
  onClose: () => void
}

export default function ViewTaskModal({ isOpen, taskId, onClose }: ViewTaskModalProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  
  const { error } = useModernToast()

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTask()
    }
  }, [isOpen, taskId])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const data = await tasksService.getTask(taskId)
      setTask(data)
    } catch (err) {
      error('Lỗi khi tải thông tin nhiệm vụ')
      console.error('Error fetching task:', err)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết nhiệm vụ</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết của nhiệm vụ
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Đang tải...</p>
            </div>
          </div>
        ) : task ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <div className="flex gap-2">
                  <Badge className={TASK_STATUS_COLORS[task.status]}>
                    {TASK_STATUS_LABELS[task.status]}
                  </Badge>
                  <Badge className={TASK_PRIORITY_COLORS[task.priority as keyof typeof TASK_PRIORITY_COLORS]}>
                    {TASK_PRIORITY_LABELS[task.priority as keyof typeof TASK_PRIORITY_LABELS]}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Người thực hiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {task.assignee ? (
                    <div 
                      className="text-sm cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => setSelectedUserId(task.assignee?.id || null)}
                    >
                      <p className="font-medium text-blue-600 hover:text-blue-800">{task.assignee.fullName}</p>
                      <p className="text-muted-foreground">{task.assignee.email}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có người thực hiện</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Dự án
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {task.project ? (
                    <div className="text-sm">
                      <p className="font-medium">{task.project.name}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có dự án</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {task.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Mô tả
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {task.dueDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hạn chót:</span>
                      <span>{format(new Date(task.dueDate), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                  {task.estimatedHours && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ước tính:</span>
                      <span>{task.estimatedHours}h</span>
                    </div>
                  )}
                  {task.weekSubmittedFor && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tuần làm việc:</span>
                      <span>{task.weekSubmittedFor}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Thông tin hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạo lúc:</span>
                    <span>{format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cập nhật lúc:</span>
                    <span>{format(new Date(task.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Đóng</Button>
        </div>

        <UserDetailModal
          isOpen={!!selectedUserId}
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      </DialogContent>
    </Dialog>
  )
}