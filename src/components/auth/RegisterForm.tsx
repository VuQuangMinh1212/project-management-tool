"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/auth/useAuth"
import { ROUTES } from "@/constants/routes"

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    lastName: z.string().min(2, "Họ phải có ít nhất 2 ký tự"),
    email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data
      // Role defaults to employee on backend, no need to send it
      await registerUser(registerData)

      // Show success message
      toast.success("Đăng ký thành công! Chào mừng bạn đến với hệ thống.")
      
      // All new registrations are employees, redirect to staff dashboard
      router.push(ROUTES.STAFF.DASHBOARD)
    } catch (error: any) {
      // Get error message from useAuth store
      const { error: authError } = useAuth.getState()
      
      // Show error toast with Vietnamese message
      if (authError) {
        toast.error(authError)
      } else {
        toast.error("Đăng ký thất bại. Vui lòng thử lại.")
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
        <CardDescription>Nhập thông tin của bạn để tạo tài khoản</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Tên</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName")}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Họ</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName")}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
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
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận Mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu của bạn"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo tài khoản
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Đã có tài khoản?{" "}
          <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
