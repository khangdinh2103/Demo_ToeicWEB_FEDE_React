import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminMenu from '../../components/AdminMenu'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { 
  Users, 
  BookOpen, 
  FileText, 
  BookMarked,
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Loader2,
  ArrowRight,
  Plus
} from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    active: number
    newToday: number
  }
  courses: {
    total: number
    published: number
    drafts: number
  }
  tests: {
    total: number
    attempts: number
  }
  vocabulary: {
    totalSets: number
    totalWords: number
  }
  revenue: {
    today: number
    thisMonth: number
    growth: number
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - trong thực tế sẽ fetch từ API
    setTimeout(() => {
      setStats({
        users: {
          total: 12450,
          active: 8900,
          newToday: 45
        },
        courses: {
          total: 125,
          published: 98,
          drafts: 27
        },
        tests: {
          total: 85,
          attempts: 15600
        },
        vocabulary: {
          totalSets: 240,
          totalWords: 3600
        },
        revenue: {
          today: 12500000,
          thisMonth: 89000000,
          growth: 12.5
        }
      })
      setLoading(false)
    }, 500)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.users.total || 0,
      change: `+${stats?.users.newToday || 0} hôm nay`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/users'
    },
    {
      title: 'Khóa học',
      value: stats?.courses.total || 0,
      change: `${stats?.courses.published || 0} đã xuất bản`,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/courses'
    },
    {
      title: 'Đề thi TOEIC',
      value: stats?.tests.total || 0,
      change: `${formatNumber(stats?.tests.attempts || 0)} lượt thi`,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/tests'
    },
    {
      title: 'Bộ từ vựng',
      value: stats?.vocabulary.totalSets || 0,
      change: `${formatNumber(stats?.vocabulary.totalWords || 0)} từ`,
      icon: BookMarked,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/practice'
    },
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(stats?.revenue.thisMonth || 0),
      change: `+${stats?.revenue.growth || 0}% so với tháng trước`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/admin/analytics',
      isLarge: true
    },
    {
      title: 'Người dùng hoạt động',
      value: stats?.users.active || 0,
      change: `${Math.round(((stats?.users.active || 0) / (stats?.users.total || 1)) * 100)}% tổng số`,
      icon: CheckCircle,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      link: '/admin/users'
    }
  ]

  const quickActions = [
    {
      title: 'Tạo khóa học mới',
      description: 'Thêm khóa học TOEIC mới vào hệ thống',
      icon: Plus,
      action: () => navigate('/admin/courses'),
      color: 'bg-blue-500'
    },
    {
      title: 'Thêm đề thi',
      description: 'Upload đề thi TOEIC thực chiến',
      icon: FileText,
      action: () => navigate('/admin/tests'),
      color: 'bg-green-500'
    },
    {
      title: 'Quản lý lộ trình',
      description: 'Tạo và chỉnh sửa learning path',
      icon: GraduationCap,
      action: () => navigate('/admin/roadmaps'),
      color: 'bg-orange-500'
    },
    {
      title: 'Thêm từ vựng',
      description: 'Tạo bộ flashcard từ vựng mới',
      icon: BookMarked,
      action: () => navigate('/admin/practice'),
      color: 'bg-purple-500'
    }
  ]

  const recentActivity = [
    { action: 'Người dùng mới đăng ký', detail: '45 người dùng hôm nay', time: 'Vừa xong', icon: Users, color: 'text-blue-600' },
    { action: 'Khóa học được xuất bản', detail: 'TOEIC Reading Strategies', time: '2 giờ trước', icon: BookOpen, color: 'text-green-600' },
    { action: 'Đề thi hoàn thành', detail: 'ETS 2024 Test 3', time: '5 giờ trước', icon: CheckCircle, color: 'text-orange-600' },
    { action: 'Thanh toán thành công', detail: '12 giao dịch', time: 'Hôm nay', icon: DollarSign, color: 'text-emerald-600' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Tổng Quan
          </h1>
          <p className="text-gray-600">
            Chào mừng trở lại! Xem tổng quan về hoạt động hệ thống StarEdu
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${stat.isLarge ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
                  {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Thao tác nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className={`${action.color} p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`p-2 rounded-lg bg-gray-100 mr-3`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {activity.detail}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4"
                  onClick={() => navigate('/admin/analytics')}
                >
                  Xem tất cả
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-green-600" />
              Trạng thái hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">API Server</p>
                  <p className="text-xs text-gray-500">Hoạt động bình thường</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Database</p>
                  <p className="text-xs text-gray-500">Kết nối ổn định</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Storage</p>
                  <p className="text-xs text-gray-500">75% còn trống</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-3 animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">AI Services</p>
                  <p className="text-xs text-gray-500">Tải cao</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
