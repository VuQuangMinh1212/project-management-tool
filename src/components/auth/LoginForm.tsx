"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useModernToast } from "@/components/ui/modern-toast-provider";

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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth/useAuth";
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/types/auth";


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
  const toast = useModernToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('remembered_email');
      const savedPassword = localStorage.getItem('remembered_password');
      const savedRememberMe = localStorage.getItem('remember_me') === 'true';
      
      if (savedEmail) setValue('email', savedEmail);
      if (savedPassword) setValue('password', savedPassword);
      if (savedRememberMe) {
        setValue('rememberMe', true);
        setRememberMe(true);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (typeof window !== 'undefined') {
        if (data.rememberMe) {
          localStorage.setItem('remembered_email', data.email);
          localStorage.setItem('remembered_password', data.password);
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remembered_email');
          localStorage.removeItem('remembered_password');
          localStorage.removeItem('remember_me');
        }
      }

      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      });

      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        const user = useAuth.getState().user;
        
        if (user?.role === "manager" || user?.role === "admin") {
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
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="text-3xl font-bold text-gray-900">Đăng nhập</CardTitle>
        <CardDescription className="text-gray-600">
          Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-11 w-full" />
            <div className="text-center">
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                {...register("email")}
                className={`h-11 ${errors.email ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  {...register("password")}
                  className={`h-11 pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors"
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
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm font-normal cursor-pointer text-gray-600"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              Đăng nhập
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href={ROUTES.REGISTER} className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
