"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useModernToast } from "@/components/ui/modern-toast-provider";
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

interface ViewUserModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewUserModal({ userId, isOpen, onClose }: ViewUserModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useModernToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (error: any) {
      toast.error("Không thể tải thông tin người dùng");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
          <DialogDescription>
            Chi tiết thông tin tài khoản người dùng.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
                <AvatarFallback className="text-lg">
                  {user.fullName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                  {roleLabels[user.role as keyof typeof roleLabels]}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">{user.id}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
              <p className="text-sm">
                {user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : "Không xác định"}
              </p>
            </div>

            {user.avatarUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">URL Avatar</p>
                <p className="text-sm break-all bg-muted p-2 rounded">{user.avatarUrl}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Không thể tải thông tin người dùng</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}