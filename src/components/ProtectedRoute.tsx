import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/use-toast'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'teacher' | 'student'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [hasShownToast, setHasShownToast] = useState(false)

  useEffect(() => {
    // Hiển thị thông báo nếu user không có quyền truy cập
    if (!hasShownToast && isAuthenticated && user && requiredRole && user.role !== requiredRole) {
      toast({
        variant: "destructive",
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản quản trị viên.",
      })
      setHasShownToast(true)
    }
  }, [isAuthenticated, user, requiredRole, hasShownToast, toast])

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Kiểm tra role nếu được yêu cầu
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
