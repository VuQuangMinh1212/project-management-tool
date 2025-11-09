'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Project, UpdateProjectData, ProjectStatus } from '@/types/project'
import { projectsService, userService } from '@/services'
import { useModernToast } from '@/components/ui/modern-toast-provider'
import type { User } from '@/types/auth'

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
  const [managers, setManagers] = useState<User[]>([])
  const [selectedManagers, setSelectedManagers] = useState<User[]>([])
  const [managersLoading, setManagersLoading] = useState(false)
  const [managerSelectOpen, setManagerSelectOpen] = useState(false)
  const [managerSearch, setManagerSearch] = useState('')
  
  const { success, error } = useModernToast()

  useEffect(() => {
    if (isOpen) {
      fetchManagers()
    }
  }, [isOpen])

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
    }
  }, [project])

  const fetchManagers = async () => {
    try {
      setManagersLoading(true)
      const data = await userService.getUsers('manager')
      setManagers(data)
    } catch (err) {
      error('Lỗi khi tải danh sách quản lý')
    } finally {
      setManagersLoading(false)
    }
  }

  const handleManagerSelect = (manager: User) => {
    const isSelected = selectedManagers.find(m => m.id === manager.id)
    if (isSelected) {
      setSelectedManagers(prev => prev.filter(m => m.id !== manager.id))
    } else {
      setSelectedManagers(prev => [...prev, manager])
    }
    setManagerSearch('')
  }

  const removeManager = (managerId: string) => {
    setSelectedManagers(prev => prev.filter(m => m.id !== managerId))
  }

  const filteredManagers = managers.filter(manager => 
    manager.fullName?.toLowerCase().includes(managerSearch.toLowerCase()) ||
    manager.email?.toLowerCase().includes(managerSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim() || !startDate) {
      error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    
    try {
      await projectsService.updateProject(project.id, {
        ...formData,
        managerId: selectedManagers.length > 0 ? selectedManagers[0].id : undefined,
        managerIds: selectedManagers.map(m => m.id),
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
              Người quản lý
            </label>
            <Popover open={managerSelectOpen} onOpenChange={setManagerSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={managerSelectOpen}
                  className="w-full justify-between"
                  disabled={managersLoading}
                >
                  {selectedManagers.length === 0 
                    ? "Chọn người quản lý..."
                    : `${selectedManagers.length} người được chọn`
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={managerSearch}
                    onValueChange={setManagerSearch}
                  />
                  <CommandEmpty>Không tìm thấy quản lý nào.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-auto">
                    {filteredManagers.map((manager) => {
                      const isSelected = selectedManagers.find(m => m.id === manager.id)
                      return (
                        <CommandItem
                          key={manager.id}
                          value={manager.fullName}
                          onSelect={() => handleManagerSelect(manager)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{manager.fullName}</span>
                            <span className="text-xs text-muted-foreground">{manager.email}</span>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            
            {selectedManagers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedManagers.map((manager) => (
                  <Badge key={manager.id} variant="secondary" className="flex items-center gap-1">
                    {manager.fullName}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeManager(manager.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
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