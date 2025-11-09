'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Search, Filter, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Project, ProjectStatus, ProjectFilters } from '@/types/project'
import { projectsService } from '@/services'
import { useModernToast } from '@/components/ui/modern-toast-provider'
import ViewProjectModal from '@/components/ui/view-project-modal'
import { useAuth } from '@/hooks/auth/useAuth'

const statusColors = {
  [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
}

export default function ManagerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ProjectFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null)
  const [startDateFrom, setStartDateFrom] = useState<Date>()
  const [startDateTo, setStartDateTo] = useState<Date>()
  const [endDateFrom, setEndDateFrom] = useState<Date>()
  const [endDateTo, setEndDateTo] = useState<Date>()
  
  const { error } = useModernToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      const managerFilters = {
        ...filters,
        managerId: user.id // Only show projects where the current user is a manager
      }
      fetchProjects(managerFilters)
    }
  }, [filters, user?.id])

  const fetchProjects = async (projectFilters: ProjectFilters) => {
    try {
      setLoading(true)
      const data = await projectsService.getProjects(projectFilters)
      setProjects(data)
    } catch (err) {
      error('Lỗi khi tải danh sách dự án')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      name: searchTerm || undefined
    }))
  }

  const handleFilterChange = (key: keyof ProjectFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDateFilterChange = () => {
    setFilters(prev => ({
      ...prev,
      startDateFrom: startDateFrom?.toISOString().split('T')[0],
      startDateTo: startDateTo?.toISOString().split('T')[0],
      endDateFrom: endDateFrom?.toISOString().split('T')[0],
      endDateTo: endDateTo?.toISOString().split('T')[0],
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setStartDateFrom(undefined)
    setStartDateTo(undefined)
    setEndDateFrom(undefined)
    setEndDateTo(undefined)
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dự án của tôi</h1>
          <p className="text-muted-foreground">Xem và theo dõi các dự án mà bạn quản lý</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và Lọc</CardTitle>
          <CardDescription>Tìm kiếm dự án theo tên và áp dụng bộ lọc</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên dự án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <label className="text-sm font-medium mb-2 block">Trạng thái</label>
                <Select onValueChange={(value) => handleFilterChange('status', value as ProjectStatus)}>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Ngày bắt đầu từ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDateFrom ? format(startDateFrom, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDateFrom} onSelect={setStartDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ngày bắt đầu đến</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDateTo ? format(startDateTo, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDateTo} onSelect={setStartDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ngày kết thúc từ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDateFrom ? format(endDateFrom, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDateFrom} onSelect={setEndDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ngày kết thúc đến</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDateTo ? format(endDateTo, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDateTo} onSelect={setEndDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end gap-2 col-span-full">
                <Button onClick={handleDateFilterChange}>Áp dụng bộ lọc</Button>
                <Button variant="outline" onClick={clearFilters}>Xóa bộ lọc</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Dự án ({filteredProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dự án</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow 
                    key={project.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setViewingProjectId(project.id)}
                  >
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[project.status]}>
                        {project.status === ProjectStatus.PLANNING && 'Đang lên kế hoạch'}
                        {project.status === ProjectStatus.ACTIVE && 'Đang thực hiện'}
                        {project.status === ProjectStatus.ON_HOLD && 'Tạm dừng'}
                        {project.status === ProjectStatus.COMPLETED && 'Hoàn thành'}
                        {project.status === ProjectStatus.CANCELLED && 'Đã hủy'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(project.startDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {project.endDate ? format(new Date(project.endDate), 'dd/MM/yyyy') : 'Chưa xác định'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewingProjectId(project.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không có dự án nào được tìm thấy
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {viewingProjectId && (
        <ViewProjectModal
          isOpen={!!viewingProjectId}
          projectId={viewingProjectId}
          onClose={() => setViewingProjectId(null)}
        />
      )}
    </div>
  )
}