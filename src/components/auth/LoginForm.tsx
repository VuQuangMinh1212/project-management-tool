"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/auth/useAuth";
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/types/auth";
import { AuthStatusIndicator } from "./AuthStatusIndicator";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập tên người dùng hoặc email"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('remembered_email') || '',
      password: localStorage.getItem('remembered_password') || '',
      rememberMe: localStorage.getItem('remember_me') === 'true',
    }
  });

  // Load saved credentials on component mount
  useState(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    const savedRememberMe = localStorage.getItem('remember_me') === 'true';
    
    if (savedEmail) setValue('email', savedEmail);
    if (savedPassword) setValue('password', savedPassword);
    if (savedRememberMe) {
      setValue('rememberMe', true);
      setRememberMe(true);
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (data.rememberMe) {
        localStorage.setItem('remembered_email', data.email);
        localStorage.setItem('remembered_password', data.password);
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
        localStorage.removeItem('remember_me');
      }

      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      });

      // Show success message
      toast.success("Đăng nhập thành công!");

      // Wait a moment for state to update
      setTimeout(() => {
        const user = useAuth.getState().user;
        console.log("Redirecting for role:", user?.role);

        if (user?.role === "manager") {
          router.push(ROUTES.MANAGER.DASHBOARD);
        } else {
          router.push(ROUTES.STAFF.DASHBOARD);
        }
      }, 100);
    } catch (error: any) {
      // Get error message from useAuth store
      const { error: authError } = useAuth.getState()
    
      if (authError) {
        toast.error(authError)
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.")
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
        <CardDescription>
          Nhập tên người dùng/email và mật khẩu để truy cập tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthStatusIndicator />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Tên người dùng hoặc Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="staff or manager"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu của bạn"
                {...register("password")}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
                        <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => {
                setRememberMe(checked as boolean);
                setValue('rememberMe', checked as boolean);
              }}
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm font-normal cursor-pointer"
            >
              Nhớ mật khẩu
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {"Chưa có tài khoản? "}
          <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
            Đăng ký
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
