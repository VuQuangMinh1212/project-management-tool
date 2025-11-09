'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import type { User as UserType } from '@/types/auth'
import { userService } from '@/services'
import { useModernToast } from '@/components/ui/modern-toast-provider'
import { useRouter } from 'next/navigation'

interface UserDetailModalProps {
  isOpen: boolean
  userId: string | null
  onClose: () => void
}

const roleLabels = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  employee: 'Nhân viên',
}

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  employee: 'bg-green-100 text-green-800',
}

export default function UserDetailModal({ isOpen, userId, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const { error } = useModernToast()

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser()
    }
  }, [isOpen, userId])

  const fetchUser = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const data = await userService.getUser(userId)
      setUser(data)
    } catch (err) {
      error('Lỗi khi tải thông tin người dùng')
      console.error('Error fetching user:', err)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToUser = () => {
    if (user) {
      router.push(`/admin/users`)
      onClose()
    }
  }

  if (!userId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
          <DialogDescription>
            Chi tiết về người dùng trong hệ thống
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Đang tải...</p>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.fullName}</h3>
                    <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                      {roleLabels[user.role as keyof typeof roleLabels]}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Thông tin hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạo lúc:</span>
                    <span>{format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cập nhật lúc:</span>
                    <span>{format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {user && (
            <Button onClick={handleNavigateToUser} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Xem chi tiết
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}