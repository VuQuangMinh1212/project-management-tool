'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CreateProjectData } from '@/types/project'
import { projectsService } from '@/services'
import { useModernToast } from '@/components/ui/modern-toast-provider'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    managerId: '',
    managerIds: [],
    startDate: '',
    endDate: '',
  })
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [managerIdsInput, setManagerIdsInput] = useState('')
  
  const { success, error } = useModernToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.managerId.trim() || !startDate) {
      error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    
    try {
      const managerIds = managerIdsInput
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)

      await projectsService.createProject({
        ...formData,
        managerIds: managerIds.length > 0 ? managerIds : undefined,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      })
      
      success('Tạo dự án thành công')
      onSuccess()
      handleReset()
    } catch (err) {
      error('Lỗi khi tạo dự án')
      console.error('Error creating project:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      managerId: '',
      managerIds: [],
      startDate: '',
      endDate: '',
    })
    setStartDate(undefined)
    setEndDate(undefined)
    setManagerIdsInput('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo dự án mới
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên dự án"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Mô tả</label>
            <Textarea
              value={formData.description}
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
              value={formData.managerId}
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo dự án'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}