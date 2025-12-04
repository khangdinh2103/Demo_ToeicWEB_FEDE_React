"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Target,
  Trophy,
  Clock,
  MessageCircle,
  PenTool,
  Mic,
  TrendingUp,
  Award,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { authApi } from "@/api/authApi"
import { testApi } from "@/api/testApi"
import type { TestAttempt } from "@/api/testApi"
import { enrollmentApi, type Enrollment } from "@/api/enrollmentApi"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [recentAttempts, setRecentAttempts] = useState<TestAttempt[]>([])
  const [enrolledRoadmaps, setEnrolledRoadmaps] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    highestScore: 0,
    targetScore: 850,
    totalTests: 0,
    averageScore: 0,
    improvement: 0
  })
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Check if redirected from payment
    const paymentSuccess = searchParams.get('payment')
    if (paymentSuccess === 'success') {
      setActiveTab('courses')
      
      // Verify payment and create enrollment
      const verifyPayment = async () => {
        const pendingPaymentId = localStorage.getItem('pending_payment_id')
        if (pendingPaymentId) {
          try {
            console.log('🔍 Verifying payment:', pendingPaymentId)
            const { paymentApi } = await import('@/api/paymentApi')
            const result = await paymentApi.verifyPayment(pendingPaymentId)
            
            console.log('📦 Verification result:', result)
            
            if (result.success && result.data) {
              console.log('✅ Payment verified, enrollment created:', result.data)
              
              // Reload enrolled roadmaps
              try {
                const enrollmentsResponse = await enrollmentApi.getEnrollmentList()
                setEnrolledRoadmaps(enrollmentsResponse.data.data)
              } catch (e) {
                console.error('Error reloading enrollments:', e)
              }
              
              alert('Thanh toán thành công! Bạn đã được ghi danh vào lộ trình.')
            } else {
              console.error('❌ Verification failed:', result)
              alert(`Không thể xác nhận thanh toán: ${result.message || 'Vui lòng liên hệ hỗ trợ'}`)
            }
          } catch (error: any) {
            console.error('❌ Payment verification error:', error)
            console.error('Error details:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            })
            
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định'
            alert(`Lỗi khi xác nhận thanh toán: ${errorMessage}`)
          } finally {
            localStorage.removeItem('pending_payment_id')
          }
        } else {
          // No payment_id saved, just show generic success
          console.log('⚠️ No pending payment ID found')
          alert('Chào mừng trở lại!')
        }
      }
      
      verifyPayment()
    }
  }, [searchParams])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const currentUser = authApi.getCurrentUser()
        
        if (!currentUser) {
          navigate('/login')
          return
        }
        
        setUser(currentUser)

        // Fetch recent test attempts
        const attemptsData = await testApi.getUserAttempts(1, 5)
        setRecentAttempts(attemptsData.data)

        // Fetch enrolled roadmaps
        try {
          const enrollmentsData = await enrollmentApi.getEnrollmentList(1, 20)
          setEnrolledRoadmaps(enrollmentsData.data.data)
        } catch (error) {
          console.error('Error fetching enrollments:', error)
        }

        // Calculate statistics
        const completedAttempts = attemptsData.data.filter((a: TestAttempt) => a.status === 'completed')
        
        if (completedAttempts.length > 0) {
          const scores = completedAttempts.map((a: TestAttempt) => a.total_score || 0)
          const highest = Math.max(...scores)
          const average = Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
          
          // Calculate improvement (first test vs last test)
          const improvement = completedAttempts.length > 1 
            ? (scores[0] || 0) - (scores[scores.length - 1] || 0)
            : 0

          setStats({
            highestScore: highest,
            targetScore: 850,
            totalTests: completedAttempts.length,
            averageScore: average,
            improvement: improvement
          })

          // Prepare chart data (reverse to show oldest to newest)
          const chartPoints = completedAttempts.slice().reverse().map((attempt: TestAttempt) => ({
            testName: typeof attempt.test_id === 'object' && attempt.test_id !== null 
              ? (attempt.test_id as any).title 
              : 'Đề thi',
            score: attempt.total_score || 0,
            listening: attempt.listening_score || 0,
            reading: attempt.reading_score || 0,
            date: new Date(attempt.completed_at || '').toLocaleDateString('vi-VN', { 
              day: '2-digit',
              month: '2-digit'
            })
          }))
          
          setChartData(chartPoints)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()

    // ✅ Reload data khi window focus (quay lại từ trang khác)
    const handleFocus = () => {
      console.log('🔄 Window focused, reloading dashboard data...')
      fetchDashboardData()
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [navigate])

  const handleLogout = async () => {
    await authApi.logout()
    navigate('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} phút ${secs} giây`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
                ) : (
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
                <CardTitle>{user?.name || 'Người dùng'}</CardTitle>
                <CardDescription>{user?.phone || ''}</CardDescription>
                <Badge variant="secondary">{user?.role === 'student' ? 'Học viên' : 'Admin'}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.highestScore}</div>
                  <div className="text-sm text-gray-600">Điểm cao nhất</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ mục tiêu</span>
                    <span>{Math.round((stats.highestScore / stats.targetScore) * 100)}%</span>
                  </div>
                  <Progress value={(stats.highestScore / stats.targetScore) * 100} />
                  <div className="text-xs text-gray-500 text-center">Mục tiêu: {stats.targetScore} điểm</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-orange-600">{stats.totalTests}</div>
                    <div className="text-xs text-gray-600">Bài thi</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{stats.averageScore}</div>
                    <div className="text-xs text-gray-600">Điểm TB</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link to="/profile">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Cài đặt
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="courses">
                  Khóa học
                  {enrolledRoadmaps.length > 0 && (
                    <Badge className="ml-2" variant="secondary">{enrolledRoadmaps.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="practice">Luyện tập</TabsTrigger>
                <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Điểm cao nhất</p>
                          <p className="text-2xl font-bold">{stats.highestScore}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Target className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Mục tiêu</p>
                          <p className="text-2xl font-bold">{stats.targetScore}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Số bài thi</p>
                          <p className="text-2xl font-bold">{stats.totalTests}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Cải thiện</p>
                          <p className="text-2xl font-bold">{stats.improvement > 0 ? '+' : ''}{stats.improvement}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Score Chart */}
                {chartData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sơ đồ điểm thi</CardTitle>
                      <CardDescription>Tiến độ cải thiện điểm số qua các lần thi</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            label={{ value: 'Ngày thi', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            domain={[0, 990]} 
                            label={{ value: 'Điểm', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                                    <p className="font-semibold text-sm mb-2">{data.testName}</p>
                                    <p className="text-xs text-gray-600 mb-2">Ngày: {data.date}</p>
                                    <div className="space-y-1">
                                      <p className="text-xs" style={{ color: '#8b5cf6' }}>
                                        Tổng điểm: <strong>{data.score}</strong>
                                      </p>
                                      <p className="text-xs" style={{ color: '#3b82f6' }}>
                                        Listening: <strong>{data.listening}</strong>
                                      </p>
                                      <p className="text-xs" style={{ color: '#10b981' }}>
                                        Reading: <strong>{data.reading}</strong>
                                      </p>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="score" stroke="#8b5cf6" name="Tổng điểm" strokeWidth={2} />
                          <Line type="monotone" dataKey="listening" stroke="#3b82f6" name="Listening" />
                          <Line type="monotone" dataKey="reading" stroke="#10b981" name="Reading" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Test Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>5 lần test gần nhất</CardTitle>
                    <CardDescription>Kết quả các bài thi gần đây của bạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentAttempts.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Chưa có bài thi nào</p>
                    ) : (
                      <div className="space-y-4">
                        {recentAttempts.map((attempt, index) => (
                          <div key={attempt._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">
                                  {typeof attempt.test_id === 'object' && attempt.test_id !== null 
                                    ? (attempt.test_id as any).title 
                                    : `Test #${index + 1}`}
                                </h4>
                                <Badge variant={attempt.status === 'completed' ? 'default' : 'secondary'}>
                                  {attempt.status === 'completed' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                                </Badge>
                              </div>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>Điểm: <strong className="text-blue-600">{attempt.total_score || 0}</strong></span>
                                <span>L: {attempt.listening_score || 0}</span>
                                <span>R: {attempt.reading_score || 0}</span>
                                {attempt.time_used && (
                                  <span>Thời gian: {formatTime(attempt.time_used)}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(attempt.started_at)}</p>
                              {index > 0 && recentAttempts[index - 1].total_score && attempt.total_score && (
                                <p className={`text-xs mt-1 ${(attempt.total_score - (recentAttempts[index - 1].total_score || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {(attempt.total_score - (recentAttempts[index - 1].total_score || 0)) > 0 ? '+' : ''}
                                  {attempt.total_score - (recentAttempts[index - 1].total_score || 0)} điểm so với lần trước
                                </p>
                              )}
                            </div>
                            {attempt.status === 'completed' && (
                              <Link to={`/practice/test/${typeof attempt.test_id === 'object' && attempt.test_id !== null ? (attempt.test_id as any)._id : attempt.test_id}/review?attemptId=${attempt._id}`}>
                                <Button size="sm" variant="outline">Xem chi tiết</Button>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Lộ trình đã đăng ký</h2>
                  <Link to="/learning-path">
                    <Button>Khám phá thêm lộ trình</Button>
                  </Link>
                </div>

                {enrolledRoadmaps.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledRoadmaps.map((enrollment) => (
                      <Card key={enrollment._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="p-0">
                          {enrollment.roadmap.thumbnail ? (
                            <img 
                              src={enrollment.roadmap.thumbnail} 
                              alt={enrollment.roadmap.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-white" />
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-2">{enrollment.roadmap.title}</h3>
                          {enrollment.roadmap.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {enrollment.roadmap.description}
                            </p>
                          )}
                          {(enrollment.roadmap.total_courses > 0 || enrollment.roadmap.estimated_duration_weeks) && (
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              {enrollment.roadmap.total_courses > 0 && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{enrollment.roadmap.total_courses} khóa học</span>
                                </div>
                              )}
                              {enrollment.roadmap.estimated_duration_weeks && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{enrollment.roadmap.estimated_duration_weeks} tuần</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Tiến độ</span>
                              <span className="font-semibold">{enrollment.completion_percentage || 0}%</span>
                            </div>
                            <Progress value={enrollment.completion_percentage || 0} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">
                              Đã mua {new Date(enrollment.enrollment_date).toLocaleDateString('vi-VN')}
                            </Badge>
                            <Link to={`/my-roadmaps/${enrollment._id}`}>
                              <Button size="sm">Học ngay</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg mb-2">Chưa có lộ trình nào</p>
                    <p className="text-sm">Khám phá các lộ trình TOEIC để bắt đầu học tập</p>
                    <Link to="/learning-path">
                      <Button className="mt-4">Khám phá lộ trình</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="practice" className="space-y-6">
                <h2 className="text-2xl font-bold">Luyện tập</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle>Luyện đề theo Part</CardTitle>
                      <CardDescription>Luyện tập từng phần của đề thi TOEIC</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Bắt đầu luyện tập</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Award className="h-8 w-8 text-green-600 mb-2" />
                      <CardTitle>Full Test</CardTitle>
                      <CardDescription>Làm đề thi TOEIC hoàn chỉnh 200 câu</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Làm bài thi</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Clock className="h-8 w-8 text-orange-600 mb-2" />
                      <CardTitle>Mini Test</CardTitle>
                      <CardDescription>Bài kiểm tra ngắn 30-50 câu</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Làm Mini Test</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai-tools" className="space-y-6">
                <h2 className="text-2xl font-bold">AI Tools</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle>AI Chatbot</CardTitle>
                      <CardDescription>Hỏi đáp về từ vựng, ngữ pháp và mẹo làm bài</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Bắt đầu chat</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <PenTool className="h-8 w-8 text-green-600 mb-2" />
                      <CardTitle>AI Writing Coach</CardTitle>
                      <CardDescription>Luyện viết với AI sửa ngữ pháp và cải thiện văn phong</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Luyện Writing</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Mic className="h-8 w-8 text-purple-600 mb-2" />
                      <CardTitle>AI Speaking Partner</CardTitle>
                      <CardDescription>Luyện nói với AI và nhận phản hồi về phát âm</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Luyện Speaking</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Target className="h-8 w-8 text-red-600 mb-2" />
                      <CardTitle>Personalized Study Plan</CardTitle>
                      <CardDescription>AI tạo kế hoạch học tập cá nhân hóa</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Tạo kế hoạch</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
