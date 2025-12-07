import { useState, useEffect } from 'react'
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
import * as statisticsApi from '../../api/statisticsApi'

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
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('month')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [loading, setLoading] = useState(true)

  // State for API data
  const [userOverview, setUserOverview] = useState<statisticsApi.UserOverview | null>(null)
  const [enrollmentOverview, setEnrollmentOverview] = useState<statisticsApi.EnrollmentOverview | null>(null)
  const [revenueData, setRevenueData] = useState<statisticsApi.TimeSeriesItem[]>([])
  const [newUsersData, setNewUsersData] = useState<statisticsApi.TimeSeriesItem[]>([])
  const [enrollmentsData, setEnrollmentsData] = useState<statisticsApi.TimeSeriesItem[]>([])
  const [topRoadmaps, setTopRoadmaps] = useState<statisticsApi.TopRoadmapItem[]>([])

  // Fetch all statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        
        // Parallel fetch all data
        const [
          userOverviewData,
          enrollmentOverviewData,
          revenueChartData,
          newUsersChartData,
          enrollmentsChartData,
          topRoadmapsData
        ] = await Promise.all([
          statisticsApi.getUserOverview(),
          statisticsApi.getEnrollmentOverview(),
          statisticsApi.getRevenueChart({ period: selectedPeriod, range: 12 }),
          statisticsApi.getNewUsersChart({ period: selectedPeriod, range: 12 }),
          statisticsApi.getEnrollmentsChart({ period: selectedPeriod, range: 12 }),
          statisticsApi.getTopRoadmaps({ limit: 5 })
        ])

        setUserOverview(userOverviewData)
        setEnrollmentOverview(enrollmentOverviewData)
        setRevenueData(revenueChartData)
        setNewUsersData(newUsersChartData)
        setEnrollmentsData(enrollmentsChartData)
        setTopRoadmaps(topRoadmapsData)
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [selectedPeriod])

  // Mock data for features not yet in API
  const courseStats: CourseStats = {
    total: 125,
    published: 98,
    enrollments: enrollmentOverview?.enrollmentsThisMonth || 0,
    completionRate: 73.5,
    averageRating: 4.2
  }

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
      userOverview,
      enrollmentOverview,
      courseStats,
      revenueData,
      newUsersData,
      enrollmentsData,
      topRoadmaps,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
          </div>
        </div>
      </div>
    )
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
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Theo ngày</SelectItem>
                  <SelectItem value="week">Theo tuần</SelectItem>
                  <SelectItem value="month">Theo tháng</SelectItem>
                  <SelectItem value="quarter">Theo quý</SelectItem>
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
                <p className="text-sm font-medium text-gray-600">Doanh thu gần nhất</p>
                <p className="text-2xl font-bold text-gray-900">
                  {revenueData.length > 0 ? formatCurrency(revenueData[revenueData.length - 1].revenue || 0) : '0 ₫'}
                </p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {revenueData.length > 0 ? new Date(revenueData[revenueData.length - 1].periodStart).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
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
                <p className="text-2xl font-bold text-gray-900">{formatNumber(userOverview?.totalUsers || 0)}</p>
                <div className="flex items-center mt-2">
                  {userOverview && userOverview.growthPct >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${userOverview && userOverview.growthPct >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {userOverview ? `${userOverview.growthPct >= 0 ? '+' : ''}${userOverview.growthPct.toFixed(1)}%` : '0%'}
                  </span>
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
                <p className="text-sm font-medium text-gray-600">Đăng ký tháng này</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(enrollmentOverview?.enrollmentsThisMonth || 0)}</p>
                <div className="flex items-center mt-2">
                  {enrollmentOverview && enrollmentOverview.pctChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${enrollmentOverview && enrollmentOverview.pctChange >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {enrollmentOverview ? `${enrollmentOverview.pctChange >= 0 ? '+' : ''}${enrollmentOverview.pctChange.toFixed(1)}%` : '0%'}
                  </span>
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
                <p className="text-sm font-medium text-gray-600">Người dùng mới</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(userOverview?.newUsersThisMonth || 0)}</p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-gray-500">trong tháng này</span>
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
              <h3 className="text-lg font-semibold">
                {selectedMetric === 'revenue' ? 'Biểu đồ Doanh thu' :
                 selectedMetric === 'enrollments' ? 'Biểu đồ Đăng ký' :
                 'Biểu đồ Người dùng mới'}
              </h3>
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
            
            {/* Bar Chart */}
            <div className="space-y-3">
              {selectedMetric === 'revenue' && revenueData.length > 0 ? (
                (() => {
                  const maxRevenue = Math.max(...revenueData.map(item => item.revenue || 0))
                  return revenueData.slice(-8).map((item, index) => {
                    const percentage = maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 100 : 0
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {new Date(item.periodStart).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(item.revenue || 0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })
                })()
              ) : selectedMetric === 'enrollments' && enrollmentsData.length > 0 ? (
                (() => {
                  const maxEnrollments = Math.max(...enrollmentsData.map(item => item.enrollments || 0))
                  return enrollmentsData.slice(-8).map((item, index) => {
                    const percentage = maxEnrollments > 0 ? ((item.enrollments || 0) / maxEnrollments) * 100 : 0
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {new Date(item.periodStart).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatNumber(item.enrollments || 0)} đăng ký
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })
                })()
              ) : selectedMetric === 'users' && newUsersData.length > 0 ? (
                (() => {
                  const maxUsers = Math.max(...newUsersData.map(item => item.newUsers || 0))
                  return newUsersData.slice(-8).map((item, index) => {
                    const percentage = maxUsers > 0 ? ((item.newUsers || 0) / maxUsers) * 100 : 0
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {new Date(item.periodStart).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatNumber(item.newUsers || 0)} người
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })
                })()
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có dữ liệu</p>
                </div>
              )}
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
          {/* Top Roadmaps */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Lộ trình hàng đầu</h3>
            {topRoadmaps.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-4">
                {topRoadmaps.map((roadmap, index) => (
                  <div key={roadmap.roadmapId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{roadmap.title}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{formatNumber(roadmap.enrollments)} học viên</span>
                          <div className="flex items-center">
                            <Award className="w-3 h-3 mr-1" />
                            {roadmap.average_rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(roadmap.revenue)}</p>
                      <p className="text-sm text-gray-500">doanh thu</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Detailed Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Thống kê chi tiết</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thống kê người dùng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600">Tổng người dùng</p>
                    <p className="text-xl font-bold text-blue-900">{formatNumber(userOverview?.totalUsers || 0)}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600">Người dùng mới</p>
                    <p className="text-xl font-bold text-green-900">{formatNumber(userOverview?.newUsersThisMonth || 0)}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600">Đăng ký tháng này</p>
                    <p className="text-xl font-bold text-purple-900">{formatNumber(enrollmentOverview?.enrollmentsThisMonth || 0)}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-600">Lộ trình phổ biến</p>
                    <p className="text-xl font-bold text-orange-900">{topRoadmaps.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thống kê thanh toán</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng đơn hàng</span>
                    <span className="font-medium">
                      {revenueData.length > 0 ? formatNumber(revenueData[revenueData.length - 1].orders || 0) : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng doanh thu</span>
                    <span className="font-medium">
                      {revenueData.length > 0 ? formatCurrency(revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0)) : '0 ₫'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Đăng ký mới</span>
                    <span className="font-medium">{formatNumber(enrollmentsData.reduce((sum, item) => sum + (item.enrollments || 0), 0))}</span>
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
