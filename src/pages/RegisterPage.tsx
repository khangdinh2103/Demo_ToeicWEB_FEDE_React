"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Lock, Eye, EyeOff, User, Phone, Loader2, XCircle, AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"
import { authApi } from "@/api/authApi"
import { setupRecaptcha, sendOTP, verifyOTP } from "@/config/firebase"
import type { RecaptchaVerifier, ConfirmationResult } from "firebase/auth"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
  const [logMessages, setLogMessages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    gender: "male" as 'male' | 'female' | 'other',
  })

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('vi-VN')
    const logMsg = `[${time}] ${message}`
    setLogMessages(prev => [...prev, logMsg])
    console.log(logMsg)
  }

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    if (!recaptchaVerifier) {
      try {
        addLog('Đang khởi tạo reCAPTCHA...')
        const verifier = setupRecaptcha('recaptcha-container')
        setRecaptchaVerifier(verifier)
        addLog('✅ reCAPTCHA khởi tạo thành công')
      } catch (error: any) {
        addLog('❌ Lỗi khởi tạo reCAPTCHA: ' + error.message)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    setIsLoading(true)
    setError("")
    addLog('Bắt đầu flow đăng ký...')

    try {
      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA chưa được khởi tạo")
      }

      addLog(`Gửi OTP tới ${formData.phone}`)

      // Send OTP via Firebase
      const result = await sendOTP(formData.phone, recaptchaVerifier)
      setConfirmationResult(result)
      setStep('otp')
      setError("")
      addLog('📩 Firebase đã gửi SMS OTP')
    } catch (err: any) {
      console.error("Error sending OTP:", err)
      const errorMessage = err.message || "Không thể gửi mã OTP. Vui lòng thử lại."
      setError(errorMessage)
      addLog("❌ Lỗi: " + errorMessage)
      
      // Reset reCAPTCHA on error
      if (recaptchaVerifier) {
        try {
          addLog('Đang khởi tạo lại reCAPTCHA...')
          const verifier = setupRecaptcha('recaptcha-container')
          setRecaptchaVerifier(verifier)
        } catch (resetError) {
          console.error('Error resetting reCAPTCHA:', resetError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!confirmationResult) {
      setError("Vui lòng gửi mã OTP trước")
      return
    }

    if (otpCode.length !== 6) {
      setError("Mã OTP phải có 6 chữ số")
      return
    }

    setIsLoading(true)
    setError("")
    addLog('Đang xác thực OTP...')

    try {
      // Verify OTP with Firebase
      const user = await verifyOTP(confirmationResult, otpCode)
      addLog('✔ OTP xác thực thành công')
      
      // Get Firebase ID token
      const firebaseIdToken = await user.getIdToken()
      addLog('🔑 Lấy Firebase ID token thành công')

      addLog('Gửi dữ liệu sang backend...')

      // Send registration to backend with Firebase token
      const response = await authApi.register({
        phone: formData.phone,
        password: formData.password,
        name: formData.name,
        gender: formData.gender,
        firebaseIdToken,
      })

      addLog('📬 Backend trả về: ' + JSON.stringify(response, null, 2))
      addLog('✅ Đăng ký thành công!')

      // Registration successful - navigate to login
      navigate("/login", { 
        state: { 
          message: "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.",
          phone: formData.phone
        } 
      })
    } catch (err: any) {
      console.error("Verify OTP error:", err)
      let errorMessage = "Xác thực thất bại. Vui lòng thử lại."
      
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại."
      } else if (err.code === 'auth/code-expired') {
        errorMessage = "Mã OTP đã hết hạn. Vui lòng gửi lại."
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(errorMessage)
      addLog("❌ Lỗi: " + errorMessage)
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
            <CardTitle className="text-2xl font-bold text-center">
              {step === 'form' ? '🔐 Đăng ký với OTP' : 'Xác thực OTP'}
            </CardTitle>
            <CardDescription className="text-center text-xs">
              {step === 'form' 
                ? 'Firebase Phone Auth – Tạo tài khoản với xác thực số điện thoại'
                : `Nhập mã OTP đã được gửi đến số ${formData.phone}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Test Phone Warning */}
            {step === 'form' && (
              <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <strong>⚠️ Đang dùng Test Phone Number:</strong>
                  <br />
                  • Thêm <code className="bg-yellow-100 px-1 rounded">+84966970852</code> với code <code className="bg-yellow-100 px-1 rounded">123456</code> vào "Phone numbers for testing" trong Firebase Console
                  <br />
                  • SMS sẽ không được gửi thực sự, chỉ nhập OTP test
                </div>
              </div>
            )}

            {/* reCAPTCHA container */}
            <div id="recaptcha-container"></div>

            {step === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0966970852"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="khang123@"
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

                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select 
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ⏳ Đang xử lý...
                  </>
                ) : (
                  "Đăng ký và nhận OTP"
                )}
              </Button>
            </form>
            ) : (
              // OTP Verification Form
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode">Mã OTP</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="Nhập 6 chữ số"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    required
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-500">
                    Mã OTP có hiệu lực trong 5 phút
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setStep('form')
                      setOtpCode('')
                      setError('')
                    }}
                    disabled={isLoading}
                  >
                    Quay lại
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={async () => {
                    setIsLoading(true)
                    setError("")
                    addLog('Gửi lại mã OTP...')
                    try {
                      if (recaptchaVerifier) {
                        const result = await sendOTP(formData.phone, recaptchaVerifier)
                        setConfirmationResult(result)
                        setOtpCode('')
                        setError("")
                        addLog('📩 Đã gửi lại mã OTP')
                      }
                    } catch (err: any) {
                      const errorMsg = "Không thể gửi lại mã OTP. Vui lòng thử lại."
                      setError(errorMsg)
                      addLog("❌ " + errorMsg)
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading}
                >
                  Gửi lại mã OTP
                </Button>
              </form>
            )}

            {/* Debug Log */}
            {logMessages.length > 0 && (
              <div className="mt-4 bg-black/90 text-green-400 p-3 rounded-lg text-xs font-mono max-h-64 overflow-y-auto">
                {logMessages.map((msg, idx) => (
                  <div key={idx}>{msg}</div>
                ))}
              </div>
            )}

            <Separator />

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
