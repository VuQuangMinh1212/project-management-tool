'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, User, FileText, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Project, ProjectStatus } from '@/types/project'
import { projectsService } from '@/services'
import { useModernToast } from '@/components/ui/modern-toast-provider'

interface ViewProjectModalProps {
  isOpen: boolean
  projectId: string
  onClose: () => void
}

const statusColors = {
  [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
}

const statusLabels = {
  [ProjectStatus.PLANNING]: 'Đang lên kế hoạch',
  [ProjectStatus.ACTIVE]: 'Đang thực hiện',
  [ProjectStatus.ON_HOLD]: 'Tạm dừng',
  [ProjectStatus.COMPLETED]: 'Hoàn thành',
  [ProjectStatus.CANCELLED]: 'Đã hủy',
}

export default function ViewProjectModal({ isOpen, projectId, onClose }: ViewProjectModalProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { error } = useModernToast()

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProject()
    }
  }, [isOpen, projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const data = await projectsService.getProject(projectId)
      setProject(data)
    } catch (err) {
      error('Lỗi khi tải thông tin dự án')
      console.error('Error fetching project:', err)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết dự án</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết của dự án
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Đang tải...</p>
            </div>
          </div>
        ) : project ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <Badge className={statusColors[project.status]}>
                  {statusLabels[project.status]}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Người quản lý
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.managers && project.managers.length > 0 ? (
                    <div className="space-y-1">
                      {project.managers.map((manager) => (
                        <div key={manager.id} className="text-sm">
                          <p className="font-medium">{manager.fullName}</p>
                          <p className="text-muted-foreground">{manager.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có người quản lý</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bắt đầu:</span>
                    <span>{format(new Date(project.startDate), 'dd/MM/yyyy')}</span>
                  </div>
                  {project.endDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kết thúc:</span>
                      <span>{format(new Date(project.endDate), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {project.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Mô tả
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            )}

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
                  <span>{format(new Date(project.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cập nhật lúc:</span>
                  <span>{format(new Date(project.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}