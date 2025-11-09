"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useModernToast } from "@/components/ui/modern-toast-provider";
import { userService, UpdateUserData } from "@/services/api/users";
import type { User } from "@/types/auth";

const updateUserSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["admin", "manager", "employee"]),
  avatarUrl: z.string().url("URL avatar không hợp lệ").optional().or(z.literal("")),
});

type UpdateUserForm = z.infer<typeof updateUserSchema>;

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useModernToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      role: user.role as "admin" | "manager" | "employee",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const onSubmit = async (data: UpdateUserForm) => {
    try {
      setIsSubmitting(true);
      
      const updateData: UpdateUserData = {
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      if (data.avatarUrl && data.avatarUrl.trim()) {
        updateData.avatarUrl = data.avatarUrl;
      }

      await userService.updateUser(user.id, updateData);
      toast.success("Cập nhật người dùng thành công!");
      onClose();
      onSuccess();
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật người dùng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin người dùng.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="role">Vai trò</Label>
            <Select 
              value={user.role as string}
              onValueChange={(value) => setValue("role", value as "admin" | "manager" | "employee")}
            >
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

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL Avatar (tuỳ chọn)</Label>
            <Input
              id="avatarUrl"
              placeholder="https://example.com/avatar.jpg"
              {...register("avatarUrl")}
              className={errors.avatarUrl ? "border-red-500" : ""}
            />
            {errors.avatarUrl && (
              <p className="text-sm text-red-600">{errors.avatarUrl.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}