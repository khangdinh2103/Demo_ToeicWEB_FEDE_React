import { useState } from 'react'
import AdminMenu from '../../components/AdminMenu'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  BookOpen, 
  Target,
  Calendar,
  Clock,
  Award,
  Activity,
  Download
} from 'lucide-react'

type RevenueData = {
  month: string
  revenue: number
  growth: number
}

type UserStats = {
  total: number
  newThisMonth: number
  active: number
  premium: number
  growthRate: number
}

type CourseStats = {
  total: number
  published: number
  enrollments: number
  completionRate: number
  averageRating: number
}

type PaymentStats = {
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
  conversionRate: number
  refundRate: number
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Mock data - trong thực tế sẽ fetch từ API
  const revenueData: RevenueData[] = [
    { month: 'Jan 2024', revenue: 45000000, growth: 12.5 },
    { month: 'Feb 2024', revenue: 52000000, growth: 15.6 },
    { month: 'Mar 2024', revenue: 48000000, growth: -7.7 },
    { month: 'Apr 2024', revenue: 58000000, growth: 20.8 },
    { month: 'May 2024', revenue: 62000000, growth: 6.9 },
    { month: 'Jun 2024', revenue: 67000000, growth: 8.1 },
    { month: 'Jul 2024', revenue: 71000000, growth: 6.0 },
    { month: 'Aug 2024', revenue: 75000000, growth: 5.6 },
    { month: 'Sep 2024', revenue: 78000000, growth: 4.0 },
    { month: 'Oct 2024', revenue: 82000000, growth: 5.1 },
    { month: 'Nov 2024', revenue: 85000000, growth: 3.7 },
    { month: 'Dec 2024', revenue: 89000000, growth: 4.7 }
  ]

  const userStats: UserStats = {
    total: 12450,
    newThisMonth: 1250,
    active: 8900,
    premium: 3200,
    growthRate: 12.3
  }

  const courseStats: CourseStats = {
    total: 125,
    published: 98,
    enrollments: 45600,
    completionRate: 73.5,
    averageRating: 4.2
  }

  const paymentStats: PaymentStats = {
    totalRevenue: 890000000,
    monthlyRevenue: 89000000,
    averageOrderValue: 850000,
    conversionRate: 8.5,
    refundRate: 2.1
  }

  const topCourses = [
    { id: 1, name: 'TOEIC Listening Mastery', enrollments: 2400, revenue: 24000000, rating: 4.8 },
    { id: 2, name: 'TOEIC Reading Strategies', enrollments: 2100, revenue: 21000000, rating: 4.6 },
    { id: 3, name: 'TOEIC Speaking Practice', enrollments: 1800, revenue: 18000000, rating: 4.7 },
    { id: 4, name: 'TOEIC Writing Skills', enrollments: 1500, revenue: 15000000, rating: 4.5 },
    { id: 5, name: 'TOEIC Full Test Practice', enrollments: 1200, revenue: 12000000, rating: 4.4 }
  ]

  const recentActivities = [
    { id: 1, type: 'payment', message: 'Thanh toán 850,000 VND từ Nguyễn Văn A', time: '5 phút trước' },
    { id: 2, type: 'registration', message: 'Người dùng mới đăng ký: Trần Thị B', time: '12 phút trước' },
    { id: 3, type: 'course_complete', message: 'Lê Văn C hoàn thành khóa TOEIC Listening', time: '25 phút trước' },
    { id: 4, type: 'payment', message: 'Thanh toán 1,200,000 VND từ Phạm Thị D', time: '1 giờ trước' },
    { id: 5, type: 'course_enroll', message: 'Hoàng Văn E đăng ký khóa TOEIC Reading', time: '2 giờ trước' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-4 h-4 text-green-600" />
      case 'registration': return <Users className="w-4 h-4 text-blue-600" />
      case 'course_complete': return <Award className="w-4 h-4 text-purple-600" />
      case 'course_enroll': return <BookOpen className="w-4 h-4 text-orange-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const exportData = () => {
    // Xuất dữ liệu thống kê
    const data = {
      period: selectedPeriod,
      userStats,
      courseStats,
      paymentStats,
      revenueData,
      topCourses,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thống kê & Báo cáo</h1>
              <p className="text-gray-600">Tổng quan về hiệu suất kinh doanh và hoạt động người dùng</p>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="thisWeek">Tuần này</SelectItem>
                  <SelectItem value="thisMonth">Tháng này</SelectItem>
                  <SelectItem value="thisQuarter">Quý này</SelectItem>
                  <SelectItem value="thisYear">Năm này</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={exportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentStats.monthlyRevenue)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+4.7%</span>
                  <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(userStats.total)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">+{userStats.growthRate}%</span>
                  <span className="text-sm text-gray-500 ml-1">tăng trưởng</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đăng ký khóa học</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(courseStats.enrollments)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">+12.8%</span>
                  <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{courseStats.completionRate}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">+2.3%</span>
                  <span className="text-sm text-gray-500 ml-1">cải thiện</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Biểu đồ Doanh thu</h3>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Doanh thu</SelectItem>
                  <SelectItem value="enrollments">Đăng ký</SelectItem>
                  <SelectItem value="users">Người dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              {revenueData.slice(-6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{item.month}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">{formatCurrency(item.revenue)}</span>
                    <div className="flex items-center">
                      {item.growth > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${item.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.growth > 0 ? '+' : ''}{item.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-1 bg-gray-100 rounded-full mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Khóa học hàng đầu</h3>
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatNumber(course.enrollments)} học viên</span>
                        <div className="flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          {course.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(course.revenue)}</p>
                    <p className="text-sm text-gray-500">doanh thu</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Thống kê chi tiết</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thống kê người dùng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Người dùng mới</p>
                    <p className="text-xl font-bold text-blue-900">{formatNumber(userStats.newThisMonth)}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600">Đang hoạt động</p>
                    <p className="text-xl font-bold text-green-900">{formatNumber(userStats.active)}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600">Premium</p>
                    <p className="text-xl font-bold text-purple-900">{formatNumber(userStats.premium)}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-600">Tỷ lệ chuyển đổi</p>
                    <p className="text-xl font-bold text-orange-900">{paymentStats.conversionRate}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thống kê thanh toán</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Giá trị đơn hàng TB</span>
                    <span className="font-medium">{formatCurrency(paymentStats.averageOrderValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tỷ lệ hoàn tiền</span>
                    <span className="font-medium">{paymentStats.refundRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng doanh thu</span>
                    <span className="font-medium">{formatCurrency(paymentStats.totalRevenue)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Hiệu suất khóa học</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Khóa học đã xuất bản</span>
                    <span className="font-medium">{courseStats.published}/{courseStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{courseStats.averageRating}/5.0</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                    <span className="font-medium">{courseStats.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
