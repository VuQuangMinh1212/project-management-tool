"use client";

import { useState, useEffect } from "react";
import { Users, Shield, Activity } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services/api/users";
import type { User } from "@/types/auth";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  if (!user || user.role !== "admin") {
    redirect("/not-found");
  }
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === "admin").length,
    managerUsers: users.filter(u => u.role === "manager").length,
    employeeUsers: users.filter(u => u.role === "employee").length,
    activeUsers: users.filter(u => u.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
              <p className="mt-2 text-gray-600">Tổng quan hệ thống và quản lý toàn bộ ứng dụng</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <Badge variant="destructive">Quản trị viên</Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tổng số người dùng */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} đang hoạt động
              </p>
            </CardContent>
          </Card>

          {/* Admin */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
              <p className="text-xs text-muted-foreground">
                Toàn quyền hệ thống
              </p>
            </CardContent>
          </Card>

          {/* Manager */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quản lý</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.managerUsers}</div>
              <p className="text-xs text-muted-foreground">
                Quản lý nhóm
              </p>
            </CardContent>
          </Card>

          {/* Employee */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.employeeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Thực hiện nhiệm vụ
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Người dùng mới nhất */}
          <Card>
            <CardHeader>
              <CardTitle>Người dùng mới nhất</CardTitle>
              <CardDescription>
                Danh sách các tài khoản được tạo gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
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
                <div className="space-y-4">
                  {users
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.id} className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role === "admin" ? "Admin" : 
                           user.role === "manager" ? "Manager" : "Employee"}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thống kê theo vai trò */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố vai trò</CardTitle>
              <CardDescription>
                Tỷ lệ phân bố người dùng theo từng vai trò
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-red-500 rounded"></div>
                    <span className="text-sm font-medium">Quản trị viên</span>
                  </div>
                  <span className="text-sm text-gray-500">{stats.adminUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-blue-500 rounded"></div>
                    <span className="text-sm font-medium">Quản lý</span>
                  </div>
                  <span className="text-sm text-gray-500">{stats.managerUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-500 rounded"></div>
                    <span className="text-sm font-medium">Nhân viên</span>
                  </div>
                  <span className="text-sm text-gray-500">{stats.employeeUsers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}