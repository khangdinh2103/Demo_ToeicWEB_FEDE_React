import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Lock } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export default function SessionExpiredModal() {
  const [open, setOpen] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const reason = localStorage.getItem('session_expired_reason')
    if (reason === 'other_device') {
      setOpen(true)
      localStorage.removeItem('session_expired_reason')
    }
  }, [])

  const handleConfirm = () => {
    setShowPasswordForm(true)
  }

  const handleChangePassword = async () => {
    if (passwords.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive"
      })
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    // TODO: Call API to change password
    // For now, just close modal
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được đổi. Vui lòng đăng nhập lại.",
      })
      navigate('/login')
    }, 1000)
  }

  const handleSkip = () => {
    setOpen(false)
    navigate('/login')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Cảnh báo bảo mật</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {!showPasswordForm ? (
              <>
                <p className="font-semibold text-red-600 mb-2">
                  Tài khoản của bạn đã được đăng nhập từ thiết bị khác!
                </p>
                <p className="text-gray-700">
                  Nếu không phải bạn thực hiện, vui lòng đổi mật khẩu ngay để bảo vệ tài khoản.
                </p>
              </>
            ) : (
              <p className="text-gray-700">
                Đổi mật khẩu để bảo vệ tài khoản của bạn
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        {showPasswordForm ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">
                <Lock className="inline h-4 w-4 mr-1" />
                Mật khẩu mới
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                <Lock className="inline h-4 w-4 mr-1" />
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>
        ) : null}

        <DialogFooter className="sm:justify-between">
          {!showPasswordForm ? (
            <>
              <Button variant="outline" onClick={handleSkip}>
                Bỏ qua
              </Button>
              <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
                Đổi mật khẩu ngay
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleSkip}>
                Để sau
              </Button>
              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? "Đang xử lý..." : "Xác nhận đổi"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
