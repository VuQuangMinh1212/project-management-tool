'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Project, UpdateProjectData, ProjectStatus } from '@/types/project'
import { projectsService } from '@/services'
import { useModernToast } from '@/components/ui/modern-toast-provider'

interface EditProjectModalProps {
  isOpen: boolean
  project: Project
  onClose: () => void
  onSuccess: () => void
}

export default function EditProjectModal({ isOpen, project, onClose, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState<UpdateProjectData>({})
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [managerIdsInput, setManagerIdsInput] = useState('')
  
  const { success, error } = useModernToast()

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        managerId: project.managerId,
        status: project.status,
      })
      setStartDate(new Date(project.startDate))
      setEndDate(project.endDate ? new Date(project.endDate) : undefined)
      setManagerIdsInput('')
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim() || !formData.managerId?.trim() || !startDate) {
      error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    
    try {
      const managerIds = managerIdsInput
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)

      await projectsService.updateProject(project.id, {
        ...formData,
        managerIds: managerIds.length > 0 ? managerIds : undefined,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      })
      
      success('Cập nhật dự án thành công')
      onSuccess()
    } catch (err) {
      error('Lỗi khi cập nhật dự án')
      console.error('Error updating project:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa dự án</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin dự án
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên dự án"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Mô tả</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả dự án"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              ID Người quản lý chính <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.managerId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
              placeholder="Nhập ID người quản lý chính"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              ID Người quản lý phụ
            </label>
            <Input
              value={managerIdsInput}
              onChange={(e) => setManagerIdsInput(e.target.value)}
              placeholder="Nhập các ID người quản lý phụ, cách nhau bằng dấu phẩy"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ví dụ: uuid-1, uuid-2, uuid-3
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Trạng thái</label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ProjectStatus }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectStatus.PLANNING}>Đang lên kế hoạch</SelectItem>
                <SelectItem value={ProjectStatus.ACTIVE}>Đang thực hiện</SelectItem>
                <SelectItem value={ProjectStatus.ON_HOLD}>Tạm dừng</SelectItem>
                <SelectItem value={ProjectStatus.COMPLETED}>Hoàn thành</SelectItem>
                <SelectItem value={ProjectStatus.CANCELLED}>Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ngày kết thúc</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}