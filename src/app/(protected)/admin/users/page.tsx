"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Edit, Trash2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useModernToast } from "@/components/ui/modern-toast-provider";
import { EditUserModal } from "@/components/ui/edit-user-modal";
import { ViewUserModal } from "@/components/ui/view-user-modal";
import ChangePasswordModal from "@/components/ui/change-password-modal";
import { userService } from "@/services/api/users";
import type { User } from "@/types/auth";

const roleLabels = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  employee: "Nhân viên",
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  employee: "bg-green-100 text-green-800",
};

const createUserSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["admin", "manager", "employee"]),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useModernToast();
  
  if (!user || user.role !== "admin") {
    redirect("/not-found");
  }
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [changePasswordUserId, setChangePasswordUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
  });

  const fetchUsers = async (role?: string) => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers(role);
      setUsers(data);
    } catch (error: any) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(roleFilter === "all" ? undefined : roleFilter);
  }, [roleFilter]);

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: CreateUserForm) => {
    try {
      setIsSubmitting(true);
      const createUserData = {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.password,
        role: data.role,
      };
      await userService.createUser(createUserData);
      toast.success("Tạo người dùng thành công!");
      setIsDialogOpen(false);
      reset();
      fetchUsers(roleFilter === "all" ? undefined : roleFilter);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tạo người dùng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      toast.success("Xóa người dùng thành công!");
      fetchUsers(roleFilter === "all" ? undefined : roleFilter);
    } catch (error: any) {
      toast.error("Không thể xóa người dùng");
    }
    setDeleteUserId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
              <p className="mt-2 text-gray-600">Tạo và quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo người dùng mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tạo người dùng mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin để tạo tài khoản người dùng mới.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ tên</Label>
                    <Input
                      id="fullName"
                      placeholder="Nhập họ tên"
                      {...register("fullName")}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      {...register("password")}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Vai trò</Label>
                    <Select onValueChange={(value) => setValue("role", value as "admin" | "manager" | "employee")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                        <SelectItem value="manager">Quản lý</SelectItem>
                        <SelectItem value="employee">Nhân viên</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="manager">Quản lý</SelectItem>
                <SelectItem value="employee">Nhân viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Danh sách người dùng
                </CardTitle>
                <CardDescription>
                  Tổng cộng {filteredUsers.length} người dùng
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/users/${user.id}`)}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                            <AvatarFallback>
                              {user.fullName?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setChangePasswordUserId(user.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setDeleteUserId(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => fetchUsers(roleFilter === "all" ? undefined : roleFilter)}
        />
      )}

      {viewingUserId && (
        <ViewUserModal
          userId={viewingUserId}
          isOpen={!!viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}

      {changePasswordUserId && (
        <ChangePasswordModal
          isOpen={!!changePasswordUserId}
          onClose={() => setChangePasswordUserId(null)}
          userId={changePasswordUserId}
        />
      )}

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}