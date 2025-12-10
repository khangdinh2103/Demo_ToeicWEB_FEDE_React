"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Phone, Lock, Eye, EyeOff, Loader2, XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { authApi } from "@/api/authApi"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let response;

      // Thử đăng nhập với Admin API trước
      try {
        response = await authApi.adminLogin({
          phone: formData.phone,
          password: formData.password,
        })
        console.log('✅ Admin API response:', response)
      } catch (adminError: any) {
        // Nếu không phải admin, thử đăng nhập Student
        console.log('Không phải admin, thử student API...')
        response = await authApi.login({
          phone: formData.phone,
          password: formData.password,
        })
        console.log('✅ Student API response:', response)
      }

      // Kiểm tra response có hợp lệ không
      if (!response) {
        throw new Error('Không nhận được phản hồi từ server')
      }

      console.log('📦 Response data:', {
        '_id': response._id,
        'id': (response as any).id,
        'role': response.role,
        'name': response.name,
        'full response': response
      });

      // Cập nhật user trong context (hỗ trợ cả _id và id)
      const userId = response._id || (response as any).id;
      setUser({
        id: userId,
        name: response.name,
        phone: response.phone,
        role: response.role,
        avatar: response.avatar,
      })

      // Chuyển hướng dựa trên role (hỗ trợ cả 'admin' và 'ADMIN')
      const userRole = response.role?.toLowerCase() || 'student';
      console.log('🔍 User role detected:', userRole);
      
      if (userRole === 'admin') {
        console.log('✅ Admin detected! Redirecting to /admin')
        navigate("/admin")
      } else {
        console.log('✅ Student/User detected! Redirecting to /')
        navigate("/")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">STAREDU</span>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">Nhập thông tin để truy cập tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0123456789"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Nhập số điện thoại đã đăng ký
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input id="remember" type="checkbox" className="rounded border-gray-300" />
                  <Label htmlFor="remember" className="text-sm">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-8">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <Link to="/terms" className="underline hover:text-gray-700">
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link to="/privacy" className="underline hover:text-gray-700">
            Chính sách bảo mật
          </Link>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  )
}
