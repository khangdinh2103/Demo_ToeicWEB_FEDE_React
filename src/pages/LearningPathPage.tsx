"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Target, Clock, Award, BookOpen, Calendar, Sparkles, ShoppingCart, Percent, Tag, Star, Users, CheckCircle } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { roadmapRecommendationApi, type RecommendationInput, type RecommendedRoadmap } from "@/api/roadmapRecommendationApi"
import { courseApi, type Course } from "@/api/courseApi"
import { paymentApi, type PaymentGateway } from "@/api/paymentApi"
import { authApi } from "@/api/authApi"
import { enrollmentApi } from "@/api/enrollmentApi"
import RoadmapTimeline from "@/components/RoadmapTimeline"
import EditableSchedule from "@/components/EditableSchedule"

export default function LearningPathPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const placementTestData = location.state as { 
    placementTestScore?: number, 
    correctAnswers?: number, 
    totalQuestions?: number 
  } | null
  
  // Form states
  const [currentScore, setCurrentScore] = useState(350)
  const [targetScore, setTargetScore] = useState(600)
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [minHoursPerDay, setMinHoursPerDay] = useState(1.5)
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(3)
  const [focusSkills, setFocusSkills] = useState<string[]>(["L&R"])
  
  // Results states
  const [recommendedRoadmaps, setRecommendedRoadmaps] = useState<RecommendedRoadmap[]>([])
  const [loading, setLoading] = useState(false)
  const [tips, setTips] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('momo')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
  // Enrollment state
  const [enrolledRoadmapIds, setEnrolledRoadmapIds] = useState<string[]>([])

  // Fetch related courses and enrollments on mount
  useEffect(() => {
    fetchRelatedCourses()
    fetchEnrollments()
  }, [])

  // Fetch related courses
  const fetchRelatedCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await courseApi.getCourses({
        page: 1,
        limit: 8,
        is_published: true
      })
      setRelatedCourses(response.data.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  // Fetch enrollments to check which roadmaps are already enrolled
  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.log('No access token, user not logged in')
        return
      }
      
      const response = await enrollmentApi.getEnrollmentList()
      if (response.data && response.data.data) {
        const enrolledIds = response.data.data.map((enrollment: any) => enrollment.roadmap._id || enrollment.roadmap)
        setEnrolledRoadmapIds(enrolledIds)
        console.log('Enrolled roadmap IDs:', enrolledIds)
      }
    } catch (error: any) {
      console.log('Error fetching enrollments:', error.message)
      // Không hiển thị alert vì có thể user chưa đăng nhập
    }
  }

  // Hàm gọi API gợi ý lộ trình
  const handleGetRecommendations = async () => {
    try {
      setLoading(true)
      const input: RecommendationInput = {
        currentScore,
        targetScore,
        daysPerWeek,
        minHoursPerDay,
        maxHoursPerDay,
        focusSkills
      }
      
      console.log('📤 Sending request:', input)
      const result = await roadmapRecommendationApi.getRecommendations(input)
      console.log('📥 Received result:', result)
      
      if (result && result.recommendedRoadmaps) {
        setRecommendedRoadmaps(result.recommendedRoadmaps)
        setTips(result.tips || [])
      } else {
        console.error('Invalid response format:', result)
        alert('Dữ liệu trả về không đúng định dạng')
      }
    } catch (error: any) {
      console.error('Error getting recommendations:', error)
      alert(error.response?.data?.message || 'Không thể lấy gợi ý lộ trình')
    } finally {
      setLoading(false)
    }
  }

  // Toggle focus skills
  const toggleFocusSkill = (skill: string) => {
    if (focusSkills.includes(skill)) {
      setFocusSkills(focusSkills.filter(s => s !== skill))
    } else {
      setFocusSkills([...focusSkills, skill])
    }
  }

  // Helper: Format price
  const formatPrice = (price: number) => {
    return `${Math.round(price).toLocaleString('vi-VN')}đ`
  }

  // Helper: Get skill label
  const getSkillLabel = (skills: string[]) => {
    const labels: { [key: string]: string } = {
      listening: "Nghe",
      reading: "Đọc",
      speaking: "Nói",
      writing: "Viết",
      vocabulary: "Từ vựng",
      grammar: "Ngữ pháp"
    }
    return skills.map(s => labels[s] || s).join(" + ")
  }

  // Sắp xếp roadmaps theo điểm mục tiêu (thấp đến cao) để học tuần tự
  const sortRoadmapsSequentially = (roadmaps: RecommendedRoadmap[]) => {
    return [...roadmaps].sort((a, b) => {
      const scoreA = a.roadmap.target_score || 0
      const scoreB = b.roadmap.target_score || 0
      return scoreA - scoreB
    })
  }

  // Get month name in Vietnamese
  const getMonthName = (date: Date) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Tạo lịch học tuần tự: hoàn thành roadmap 1 trước, sau đó mới đến roadmap 2
  const generateSequentialCalendar = () => {
    if (!recommendedRoadmaps || recommendedRoadmaps.length === 0) return { weeks: [], legend: [], editablePlan: [], monthName: '' }
    
    const sortedRoadmaps = sortRoadmapsSequentially(recommendedRoadmaps)
    const calendarMap = new Map()
    const editablePlan: any[] = []
    
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', dot: 'bg-blue-500' },
      { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', dot: 'bg-green-500' }
    ]
    
    const legend = sortedRoadmaps.map((rm, idx) => ({
      name: rm.roadmap.title,
      color: colors[idx % colors.length]
    }))
    
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    let daysStudiedThisWeek = 0
    
    // Hàm helper để tăng ngày học (respecting daysPerWeek)
    const advanceToNextStudyDay = () => {
      currentDate.setDate(currentDate.getDate() + 1)
      
      // Nếu đã học đủ số ngày trong tuần, nhảy sang tuần sau
      if (daysStudiedThisWeek >= daysPerWeek) {
        // Tìm Chủ nhật tiếp theo (bắt đầu tuần mới)
        while (currentDate.getDay() !== 0) {
          currentDate.setDate(currentDate.getDate() + 1)
        }
        // Chuyển sang Thứ 2
        currentDate.setDate(currentDate.getDate() + 1)
        daysStudiedThisWeek = 0
      }
      
      // Nếu là Chủ nhật, chuyển sang Thứ 2
      if (currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + 1)
        daysStudiedThisWeek = 0
      }
    }
    
    // Xử lý từng roadmap tuần tự
    sortedRoadmaps.forEach((roadmap, roadmapIndex) => {
      const color = colors[roadmapIndex % colors.length]
      
      roadmap.dailyPlan.forEach((day: any) => {
        // Tạo date key cho ngày học
        const dateKey = currentDate.toISOString().split('T')[0]
        
        if (!calendarMap.has(dateKey)) {
          calendarMap.set(dateKey, {
            date: new Date(currentDate),
            dateString: dateKey,
            roadmaps: []
          })
        }
        
        const planItem = {
          roadmapId: roadmap.roadmap._id,
          roadmapName: roadmap.roadmap.title,
          color: color,
          sessions: day.sessions,
          totalMinutes: day.totalMinutes,
          date: new Date(currentDate)
        }
        
        calendarMap.get(dateKey).roadmaps.push(planItem)
        editablePlan.push(planItem)
        
        // Tăng số ngày đã học trong tuần
        daysStudiedThisWeek++
        
        // Chuyển sang ngày học tiếp theo
        advanceToNextStudyDay()
      })
    })
    
    // Organize into weeks
    const allDates = Array.from(calendarMap.values()).sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    )
    
    if (allDates.length === 0) return { weeks: [], legend, editablePlan, monthName: '' }
    
    const startDate = new Date(allDates[0].date)
    
    // Calculate current month based on offset
    const viewDate = new Date(startDate)
    viewDate.setMonth(viewDate.getMonth() + currentMonthOffset)
    
    // Get first day of the month
    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    
    // Get start of calendar (Sunday before or on first day of month)
    const calendarStart = new Date(monthStart)
    calendarStart.setDate(monthStart.getDate() - monthStart.getDay())
    
    // Show only 4 weeks (28 days)
    const calendarEnd = new Date(calendarStart)
    calendarEnd.setDate(calendarStart.getDate() + 27) // 4 weeks = 28 days
    
    const monthName = getMonthName(viewDate)
    
    const weeks = []
    let currentWeekStart = new Date(calendarStart)
    
    while (currentWeekStart <= calendarEnd) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentWeekStart)
        dayDate.setDate(currentWeekStart.getDate() + i)
        const dateKey = dayDate.toISOString().split('T')[0]
        
        week.push({
          date: dayDate,
          dateString: dateKey,
          data: calendarMap.get(dateKey) || null,
          isCurrentMonth: dayDate.getMonth() === viewDate.getMonth()
        })
      }
      weeks.push(week)
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }
    
    return { weeks, legend, editablePlan, monthName }
  }

  // State cho việc chỉnh sửa lịch
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [savedSchedule, setSavedSchedule] = useState<any>(null)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)

  const goToPreviousMonth = () => {
    setCurrentMonthOffset(prev => prev - 1)
  }

  const goToNextMonth = () => {
    setCurrentMonthOffset(prev => prev + 1)
  }

  const goToCurrentMonth = () => {
    setCurrentMonthOffset(0)
  }

  const { weeks, legend, monthName } = generateSequentialCalendar()

  const handleSaveSchedule = () => {
    const scheduleData = generateSequentialCalendar()
    setSavedSchedule({
      roadmaps: recommendedRoadmaps,
      calendar: scheduleData,
      savedAt: new Date().toISOString(),
      userInfo: {
        currentScore,
        targetScore,
        daysPerWeek,
        minHoursPerDay,
        maxHoursPerDay,
        focusSkills
      }
    })
    
    // Lưu vào localStorage
    localStorage.setItem('starEdu_savedSchedule', JSON.stringify({
      roadmaps: recommendedRoadmaps,
      calendar: scheduleData,
      savedAt: new Date().toISOString(),
      userInfo: {
        currentScore,
        targetScore,
        daysPerWeek,
        minHoursPerDay,
        maxHoursPerDay,
        focusSkills
      }
    }))
    
    alert('✅ Đã lưu lịch trình học thành công!')
    setIsEditingSchedule(false)
  }

  const handleEnrollAll = async () => {
    // Check if user is logged in
    const user = authApi.getCurrentUser()
    if (!user || !authApi.isAuthenticated()) {
      alert('Vui lòng đăng nhập để đăng ký lộ trình')
      navigate('/login')
      return
    }

    if (!recommendedRoadmaps || recommendedRoadmaps.length === 0) {
      alert('Không có lộ trình nào để đăng ký')
      return
    }

    // Check if all roadmaps are already enrolled
    const allEnrolled = recommendedRoadmaps.every(item => 
      enrolledRoadmapIds.includes(item.roadmap._id)
    );
    
    if (allEnrolled) {
      alert('Bạn đã đăng ký tất cả các lộ trình này rồi!')
      navigate('/dashboard')
      return
    }

    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    if (!recommendedRoadmaps || recommendedRoadmaps.length === 0) {
      alert('Không có lộ trình nào để thanh toán')
      return
    }

    try {
      setIsProcessingPayment(true)

      const redirectUrl = `${window.location.origin}/dashboard?payment=success`

      // Lọc chỉ những roadmap chưa được enroll
      const unenrolledRoadmaps = recommendedRoadmaps.filter(item => 
        !enrolledRoadmapIds.includes(item.roadmap._id)
      );

      if (unenrolledRoadmaps.length === 0) {
        alert('Tất cả lộ trình đã được đăng ký!')
        setShowPaymentModal(false)
        setIsProcessingPayment(false)
        return
      }

      // Tạo 1 PAYMENT DUY NHẤT cho TẤT CẢ roadmaps
      const roadmapIds = unenrolledRoadmaps.map(item => item.roadmap._id);
      
      console.log('📤 Creating single payment for roadmaps:', unenrolledRoadmaps.map(r => ({
        id: r.roadmap._id,
        title: r.roadmap.title
      })))

      const response = await paymentApi.createPayment({
        roadmap_ids: roadmapIds, // Gửi array roadmap IDs
        gateway: selectedGateway,
        redirect_url: redirectUrl
      })

      console.log('📥 Payment response:', response)

      const paymentData = response.data || response
      const paymentUrl = paymentData.payment_url || (paymentData as any).paymentUrl
      const paymentId = paymentData.payment_id

      console.log('🔗 Payment URL:', paymentUrl)
      console.log('💾 Payment ID:', paymentId)

      if (paymentUrl && paymentId) {
        // Lưu payment ID (chỉ 1 ID vì chỉ tạo 1 payment)
        localStorage.setItem('pending_payment_id', paymentId)
        console.log('💾 Saved payment ID:', paymentId)

        // Lưu schedule config để tạo schedule sau khi payment thành công
        // CHỈ bao gồm roadmaps CHƯA ENROLL
        const scheduleConfig = {
          roadmap_ids: unenrolledRoadmaps.map(r => r.roadmap._id),
          schedule_config: {
            days_per_week: daysPerWeek,
            min_hours_per_day: minHoursPerDay,
            max_hours_per_day: maxHoursPerDay,
            start_date: new Date().toISOString(),
            focus_skills: focusSkills
          }
        }
        localStorage.setItem('pending_schedule_config', JSON.stringify(scheduleConfig))
        console.log('📅 Saved schedule config:', scheduleConfig)

        setShowPaymentModal(false)
        setIsProcessingPayment(false)
        window.open(paymentUrl, '_blank')
        
        const roadmapCount = unenrolledRoadmaps.length;
        alert(`Đã mở trang thanh toán cho ${roadmapCount} lộ trình trong tab mới. Sau khi thanh toán xong, vui lòng quay lại trang này và vào Dashboard để xem khóa học.`)
      } else {
        throw new Error('Không nhận được URL thanh toán')
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error)
      alert(`Lỗi thanh toán: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Load saved schedule on mount
  useEffect(() => {
    const saved = localStorage.getItem('starEdu_savedSchedule')
    if (saved) {
      try {
        const parsedSchedule = JSON.parse(saved)
        setSavedSchedule(parsedSchedule)
      } catch (error) {
        console.error('Error loading saved schedule:', error)
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Placement Test Result Banner */}
        {placementTestData && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-1">
                    Kết quả Test Đầu Vào: {placementTestData.placementTestScore} điểm
                  </h3>
                  <p className="text-green-700 mb-2">
                    Bạn đã trả lời đúng {placementTestData.correctAnswers}/{placementTestData.totalQuestions} câu 
                    ({((placementTestData.correctAnswers! / placementTestData.totalQuestions!) * 100).toFixed(1)}%)
                  </p>
                  <Badge className="bg-green-600 text-white">
                    Lộ trình học đã được tùy chỉnh dựa trên kết quả của bạn
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* === PHẦN GỢI Ý LỘ TRÌNH THÔNG MINH === */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle className="text-2xl text-purple-900">Gợi ý lộ trình học thông minh</CardTitle>
                <p className="text-sm text-purple-700 mt-1">Nhập thông tin của bạn để nhận gợi ý lộ trình phù hợp nhất</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Trình độ hiện tại */}
              <div>
                <Label htmlFor="currentScore" className="text-lg font-semibold mb-2 block">
                  Điểm hiện tại
                </Label>
                <Input
                  id="currentScore"
                  type="number"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(Number(e.target.value))}
                  placeholder="VD: 350"
                  className="text-lg"
                />
                <p className="text-sm text-gray-600 mt-1">L&R: 0-990 | S&W: 0-400 | 4 kỹ năng: tổng cả 2</p>
              </div>

              {/* Mục tiêu */}
              <div>
                <Label htmlFor="targetScore" className="text-lg font-semibold mb-2 block">
                  Điểm mục tiêu
                </Label>
                <Input
                  id="targetScore"
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  placeholder="VD: 600"
                  className="text-lg"
                />
                <p className="text-sm text-gray-600 mt-1">Điểm bạn muốn đạt được</p>
              </div>

              {/* Số ngày học/tuần */}
              <div>
                <Label className="text-lg font-semibold mb-2 block">
                  Số ngày học mỗi tuần: <span className="text-purple-600">{daysPerWeek} ngày</span>
                </Label>
                <Slider
                  value={[daysPerWeek]}
                  onValueChange={(value) => setDaysPerWeek(value[0])}
                  min={1}
                  max={7}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>1 ngày</span>
                  <span>7 ngày</span>
                </div>
              </div>

              {/* Số giờ/ngày */}
              <div>
                <Label className="text-lg font-semibold mb-2 block">
                  Thời gian học mỗi ngày: <span className="text-purple-600">{minHoursPerDay}h - {maxHoursPerDay}h</span>
                </Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm">Tối thiểu: {minHoursPerDay}h</Label>
                    <Slider
                      value={[minHoursPerDay]}
                      onValueChange={(value) => setMinHoursPerDay(value[0])}
                      min={0.5}
                      max={5}
                      step={0.5}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Tối đa: {maxHoursPerDay}h</Label>
                    <Slider
                      value={[maxHoursPerDay]}
                      onValueChange={(value) => setMaxHoursPerDay(value[0])}
                      min={0.5}
                      max={8}
                      step={0.5}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Skills */}
            <div className="mb-6">
              <Label className="text-lg font-semibold mb-3 block">Kỹ năng muốn tập trung</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={focusSkills.includes("L&R") ? "default" : "outline"}
                  onClick={() => toggleFocusSkill("L&R")}
                  className="flex-1"
                >
                  📖 Listening & Reading
                </Button>
                <Button
                  type="button"
                  variant={focusSkills.includes("S&W") ? "default" : "outline"}
                  onClick={() => toggleFocusSkill("S&W")}
                  className="flex-1"
                >
                  💬 Speaking & Writing
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleGetRecommendations}
              disabled={loading || focusSkills.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6"
            >
              {loading ? "Đang tìm kiếm..." : "🎯 Tìm lộ trình phù hợp"}
            </Button>
          </CardContent>
        </Card>

        {/* === KẾT QUẢ GỢI Ý === */}
        {recommendedRoadmaps && recommendedRoadmaps.length > 0 && (
          <div className="mb-8 space-y-6">
            {/* Tips */}
            {tips && tips.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">💡 Lời khuyên dành cho bạn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-blue-800">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Roadmap Timeline Visualization */}
            <RoadmapTimeline roadmaps={recommendedRoadmaps} />

            {/* === COMBINED PRICING SECTION === */}
            <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl mb-8">
              <CardContent className="py-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Tag className="h-8 w-8 text-yellow-300" />
                  <Badge className="bg-yellow-300 text-orange-600 text-lg px-4 py-1 font-bold">
                    GIẢM GIÁ 20%
                  </Badge>
                  <Percent className="h-8 w-8 text-yellow-300" />
                </div>
                
                <h2 className="text-4xl font-bold mb-3 text-center">
                  Đăng ký lộ trình ngay!
                </h2>
                
                <p className="text-white/95 text-lg text-center mb-6 max-w-3xl mx-auto">
                  Đăng ký trọn bộ <strong>{recommendedRoadmaps.reduce((sum, item) => sum + item.courses.length, 0)} khóa học</strong> trong {recommendedRoadmaps.length} lộ trình này và nhận ngay ưu đãi giảm <strong>20%</strong>!
                </p>

                {/* Price Comparison */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Price */}
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-2">Giá gốc:</p>
                      <p className="text-2xl font-bold line-through text-white/60">
                        {formatPrice(recommendedRoadmaps.reduce((sum, item) => sum + item.roadmap.price, 0))}
                      </p>
                    </div>

                    {/* Discounted Price */}
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-2">Giá sau giảm:</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(recommendedRoadmaps.reduce((sum, item) => sum + item.roadmap.price, 0) * 0.8)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t-2 border-white/30 my-4"></div>

                  {/* Final Price */}
                  <div className="text-center">
                    <p className="text-yellow-300 text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      GIÁ LỘ TRÌNH:
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-5xl font-black text-white drop-shadow-lg">
                        {formatPrice(recommendedRoadmaps.reduce((sum, item) => sum + item.roadmap.price, 0) * 0.8)}
                      </p>
                      <Badge className="bg-yellow-300 text-red-600 text-xl px-3 py-1 font-bold animate-pulse">
                        -20%
                      </Badge>
                    </div>
                    <p className="text-green-300 text-lg font-semibold mt-3">
                      Tiết kiệm: {formatPrice(recommendedRoadmaps.reduce((sum, item) => sum + item.roadmap.price, 0) * 0.2)}
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 justify-center flex-wrap">
                  {(() => {
                    const allEnrolled = recommendedRoadmaps.every(item => 
                      enrolledRoadmapIds.includes(item.roadmap._id)
                    );
                    const unenrolledCount = recommendedRoadmaps.filter(item => 
                      !enrolledRoadmapIds.includes(item.roadmap._id)
                    ).length;

                    if (allEnrolled) {
                      return (
                        <Button 
                          size="lg" 
                          className="bg-green-500 text-white hover:bg-green-600 text-xl font-bold px-10 py-7 shadow-2xl hover:scale-105 transition-transform"
                          onClick={() => navigate('/dashboard')}
                        >
                          <CheckCircle className="h-6 w-6 mr-2" />
                          VÀO HỌC NGAY
                        </Button>
                      );
                    } else {
                      return (
                        <>
                          <Button 
                            size="lg" 
                            className="bg-yellow-400 text-orange-600 hover:bg-yellow-300 text-xl font-bold px-10 py-7 shadow-2xl hover:scale-105 transition-transform"
                            onClick={handleEnrollAll}
                          >
                            <ShoppingCart className="h-6 w-6 mr-2" />
                            {unenrolledCount === recommendedRoadmaps.length 
                              ? 'ĐĂNG KÝ NGAY' 
                              : `ĐĂNG KÝ ${unenrolledCount} LỘ TRÌNH CÒN LẠI`
                            }
                          </Button>
                          <Button 
                            size="lg" 
                            variant="outline"
                            className="bg-transparent border-3 border-white text-white hover:bg-white/10 text-lg px-8 py-7"
                            onClick={() => setShowCalendar(true)}
                          >
                            <Calendar className="h-5 w-5 mr-2" />
                            Xem lịch học
                          </Button>
                        </>
                      );
                    }
                  })()}
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center gap-8 mt-8 flex-wrap">
                  <div className="text-center">
                    <div className="bg-white/20 rounded-full p-3 inline-block mb-2">
                      <Award className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-white/90">Chứng chỉ</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-full p-3 inline-block mb-2">
                      <Target className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-white/90">Đạt mục tiêu</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-full p-3 inline-block mb-2">
                      <Clock className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-white/90">Học linh hoạt</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Roadmaps Details */}
            <div className="space-y-6">
              
              {recommendedRoadmaps.map((item, index) => {
                const roadmap = item.roadmap;
                const discountedCost = roadmap.price * (1 - roadmap.discount_percentage / 100);
                const isEnrolled = enrolledRoadmapIds.includes(roadmap._id);
                
                return (
                <div key={index}>
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl text-purple-900">{roadmap.title}</CardTitle>
                          {isEnrolled && (
                            <Badge className="bg-green-600 text-white px-3 py-1">
                              <CheckCircle className="h-4 w-4 mr-1 inline" />
                              Đã đăng ký
                            </Badge>
                          )}
                        </div>
                        <p className="text-purple-700 mt-2">{roadmap.description}</p>
                      </div>
                      <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
                        {roadmap.target_score} điểm
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-gray-900">{item.courses.length}</div>
                        <div className="text-sm text-gray-600">Khóa học</div>
                      </div>
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-gray-900">
                          {item.courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Bài học</div>
                      </div>
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold text-gray-900">{item.estimatedWeeks}</div>
                        <div className="text-sm text-gray-600">Tuần</div>
                      </div>
                      <div className="text-center">
                        <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold text-gray-900">
                          {item.courses.reduce((sum, c) => sum + c.lessons.reduce((s2: number, l: any) => s2 + (l.sections?.length || 0), 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Sections</div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Giá gốc:</p>
                          <p className="text-lg line-through text-gray-500">
                            {roadmap.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600 font-semibold">
                            Giảm {roadmap.discount_percentage}%
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(discountedCost).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mb-4">
                      <Button
                        onClick={() => setShowCalendar(true)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Xem lịch học tổng hợp
                      </Button>
                      {isEnrolled ? (
                        <Button
                          onClick={() => navigate('/dashboard')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Vào học ngay
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigate(`/learning-path/detail/${roadmap._id}`)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Xem chi tiết lộ trình
                        </Button>
                      )}
                    </div>
                    
                    {isEnrolled && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ Bạn đã đăng ký lộ trình này. Truy cập Dashboard để bắt đầu học!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* === LỊCH HỌC TỔNG HỢP (CALENDAR VIEW) === */}
        {showCalendar && recommendedRoadmaps && recommendedRoadmaps.length > 0 && (
          <Card className="mb-8 border-2 border-indigo-300 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-black flex items-center gap-3">
                    <span className="text-4xl">📅</span>
                    <span>Lịch học tuần tự</span>
                  </CardTitle>
                  <p className="text-sm text-indigo-100 mt-2 font-medium">
                    🎯 Hoàn thành từng lộ trình theo thứ tự điểm số tăng dần
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Month Navigation */}
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <Button
                      onClick={goToPreviousMonth}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    >
                      ‹
                    </Button>
                    <span className="text-sm font-bold min-w-[120px] text-center">
                      {monthName}
                    </span>
                    <Button
                      onClick={goToCurrentMonth}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 text-xs px-2 h-8"
                    >
                      Hôm nay
                    </Button>
                    <Button
                      onClick={goToNextMonth}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    >
                      ›
                    </Button>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                  <Button
                    onClick={handleSaveSchedule}
                    className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold"
                    size="lg"
                  >
                    💾 Lưu lịch trình
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCalendar(false)}
                    className="text-white hover:bg-white/20 font-bold"
                    size="lg"
                  >
                    ✕ Đóng
                  </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Saved Schedule Info */}
              {savedSchedule && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold">
                    ✅ Lịch đã lưu: {new Date(savedSchedule.savedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}

              {/* Edit Mode Toggle */}
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                  variant={isEditingSchedule ? "default" : "outline"}
                  className={isEditingSchedule ? "bg-blue-600" : ""}
                >
                  {isEditingSchedule ? "📋 Xem lịch" : "✏️ Chỉnh sửa lịch"}
                </Button>
              </div>

              {/* Editable Schedule View */}
              {isEditingSchedule ? (
                <EditableSchedule
                  schedule={generateSequentialCalendar().editablePlan}
                  onSave={(updatedSchedule) => {
                    // Save the updated schedule
                    const scheduleData = {
                      roadmaps: recommendedRoadmaps,
                      editablePlan: updatedSchedule,
                      savedAt: new Date().toISOString(),
                      userInfo: {
                        currentScore,
                        targetScore,
                        daysPerWeek,
                        minHoursPerDay,
                        maxHoursPerDay,
                        focusSkills
                      }
                    }
                    
                    localStorage.setItem('starEdu_savedSchedule', JSON.stringify(scheduleData))
                    setSavedSchedule(scheduleData)
                    setIsEditingSchedule(false)
                    alert('✅ Đã lưu lịch trình đã chỉnh sửa!')
                  }}
                  onCancel={() => setIsEditingSchedule(false)}
                />
              ) : (
                <>
                  {/* Legend */}
                  <div className="flex gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex-wrap shadow-sm">
                    {legend.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-3 h-3 rounded-full ${item.color.dot} ring-2 ring-offset-1 ring-gray-200`}></div>
                        <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto overflow-y-visible">
                <div className="min-w-[800px]">
                  {/* Header - Days of week */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => (
                      <div 
                        key={day} 
                        className={`text-center font-bold py-3 rounded-xl shadow-sm ${
                          idx === 0 || idx === 6 
                            ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600' 
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Weeks */}
                  {weeks.map((week: any, weekIdx: number) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-2 mb-2">
                      {week.map((dayCell: any, dayIdx: number) => {
                        const isToday = dayCell.date.toDateString() === new Date().toDateString()
                        const hasData = dayCell.data && dayCell.data.roadmaps && dayCell.data.roadmaps.length > 0
                        const isWeekend = dayIdx === 0 || dayIdx === 6
                        const isCurrentMonth = dayCell.isCurrentMonth
                        
                        return (
                          <div
                            key={dayIdx}
                            className={`min-h-[160px] p-3 rounded-xl border-2 transition-all duration-200 ${
                              !isCurrentMonth
                                ? 'bg-gray-100 border-gray-200 opacity-40'
                                : isToday 
                                  ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 ring-4 ring-indigo-100 shadow-lg' 
                                  : isWeekend 
                                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200' 
                                    : 'bg-white border-gray-200 hover:border-indigo-200'
                            } ${hasData && isCurrentMonth ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1' : ''}`}
                          >
                            {/* Date Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                isToday 
                                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md' 
                                  : isWeekend 
                                    ? 'bg-gray-200 text-gray-600' 
                                    : 'bg-gray-100 text-gray-700'
                              }`}>
                                {dayCell.date.getDate()}
                              </div>
                              {isToday && (
                                <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full">
                                  HÔM NAY
                                </span>
                              )}
                            </div>

                            {/* Study sessions */}
                            {hasData && isCurrentMonth ? (
                              <div className="space-y-1.5">
                                {dayCell.data.roadmaps.map((rm: any, rmIdx: number) => (
                                  <div key={rmIdx} className="space-y-1">
                                    {rm.sessions.map((session: any, sIdx: number) => (
                                      <div
                                        key={sIdx}
                                        className={`group relative p-2 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-md ${rm.color.bg} ${rm.color.border} ${rm.color.text}`}
                                      >
                                        {/* Lesson name */}
                                        <div className="font-semibold text-[11px] leading-tight truncate">
                                          {session.lessonTitle || session.sectionTitle || `Section ${sIdx + 1}`}
                                        </div>
                                        
                                        {/* Time */}
                                        <div className="flex items-center gap-1 text-[10px] opacity-80 mt-0.5">
                                          <Clock className="h-3 w-3" />
                                          <span>{session.duration}m</span>
                                        </div>

                                        {/* Hover tooltip with full details */}
                                        <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-2xl z-[9999] w-[200px] pointer-events-none border border-gray-700">
                                          <div className="font-bold mb-1 text-yellow-300 truncate">{rm.roadmapName}</div>
                                          <div className="text-gray-200 mb-0.5 text-[10px] truncate">📚 {session.courseTitle}</div>
                                          <div className="text-blue-300 mb-0.5 text-[10px] truncate">📖 {session.lessonTitle}</div>
                                          <div className="text-green-300 mb-0.5 text-[10px] truncate">📝 {session.sectionTitle}</div>
                                          <div className="text-gray-400 text-[10px] mt-1 pt-1 border-t border-gray-700">
                                            ⏱️ {session.duration}m • {session.type}
                                          </div>
                                          {/* Arrow */}
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-20 text-center">
                                <Calendar className="w-6 h-6 text-gray-300 mb-1" />
                                <p className="text-[10px] text-gray-400 font-medium">Nghỉ</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-blue-600">
                    {weeks.flat().filter((d: any) => d.data?.roadmaps?.length > 0).length}
                  </div>
                  <div className="text-sm text-blue-700 font-semibold mt-1">Ngày học</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-green-600">
                    {recommendedRoadmaps.length}
                  </div>
                  <div className="text-sm text-green-700 font-semibold mt-1">Lộ trình</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-purple-600">
                    {weeks.length}
                  </div>
                  <div className="text-sm text-purple-700 font-semibold mt-1">Tuần</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-black text-orange-600">
                    {recommendedRoadmaps.reduce((sum, item) => sum + item.courses.length, 0)}
                  </div>
                  <div className="text-sm text-orange-700 font-semibold mt-1">Khóa học</div>
                </div>
              </div>

              {/* Info Tips */}
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">💡</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-semibold mb-1">Mẹo học tập hiệu quả:</p>
                    <p className="text-sm text-blue-800">
                      Di chuột qua mỗi ô ngày để xem chi tiết buổi học. Bạn sẽ học tuần tự từ lộ trình điểm thấp đến cao để đảm bảo nền tảng vững chắc!
                    </p>
                  </div>
                </div>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* === PRODUCT CAROUSEL - ALWAYS VISIBLE === */}
      <div className="bg-white py-12 border-t-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Khóa học được đề xuất
            </h2>
            <p className="text-gray-600">
              Các khóa học phổ biến giúp bạn nâng cao kỹ năng TOEIC
            </p>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : relatedCourses.length > 0 ? (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
                {relatedCourses.map((course) => (
                  <Card key={course._id} className="hover:shadow-lg transition-shadow flex-shrink-0 w-80">
                    <div className="relative">
                      <img
                        src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        {getSkillLabel(course.skill_groups)}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({course.total_reviews})</span>
                          </div>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {course.total_enrollments.toLocaleString()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            Nhiều bài học
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Online
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              {course.is_free ? (
                                <span className="text-2xl font-bold text-green-600">
                                  Miễn phí
                                </span>
                              ) : (
                                <div>
                                  <span className="text-2xl font-bold text-blue-600">
                                    {(course.price || 0).toLocaleString('vi-VN')}đ
                                  </span>
                                  {course.original_price && course.original_price > (course.price || 0) && (
                                    <span className="text-sm text-gray-400 line-through ml-2">
                                      {course.original_price.toLocaleString('vi-VN')}đ
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => navigate(`/courses/${course._id}`)}
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Đang tải khóa học...</p>
            </div>
          )}
        </div>
      </div>

      {/* === PAYMENT MODAL === */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-center">Chọn phương thức thanh toán</h3>
              
              <div className="space-y-3 mb-6">
                {/* MoMo */}
                <button
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                    selectedGateway === 'momo' 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                  onClick={() => setSelectedGateway('momo')}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" 
                      alt="MoMo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">MoMo</div>
                    <div className="text-sm text-gray-500">Ví điện tử MoMo</div>
                  </div>
                  {selectedGateway === 'momo' && (
                    <CheckCircle className="h-6 w-6 text-pink-500" />
                  )}
                </button>

                {/* VNPay */}
                <button
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                    selectedGateway === 'vnpay' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedGateway('vnpay')}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                    <img 
                      src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" 
                      alt="VNPay" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">VNPay</div>
                    <div className="text-sm text-gray-500">Cổng thanh toán VNPay</div>
                  </div>
                  {selectedGateway === 'vnpay' && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </button>

                {/* ZaloPay */}
                <button
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                    selectedGateway === 'zalopay' 
                      ? 'border-cyan-500 bg-cyan-50' 
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                  onClick={() => setSelectedGateway('zalopay')}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                    <img 
                      src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" 
                      alt="ZaloPay" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">ZaloPay</div>
                    <div className="text-sm text-gray-500">Ví điện tử ZaloPay</div>
                  </div>
                  {selectedGateway === 'zalopay' && (
                    <CheckCircle className="h-6 w-6 text-cyan-500" />
                  )}
                </button>
              </div>

              {/* Combo Pricing Info */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Combo {recommendedRoadmaps.length} lộ trình</span>
                  <Badge className="bg-red-500 text-white">-20%</Badge>
                </div>
                <div className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {recommendedRoadmaps.map(r => r.roadmap.title).join(', ')}
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Giá gốc:</span>
                  <span className="text-sm line-through text-gray-400">
                    {formatPrice(recommendedRoadmaps.reduce((sum, item) => sum + item.roadmap.price, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(recommendedRoadmaps.reduce((sum, item) => sum + item.roadmap.price, 0) * 0.8)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessingPayment}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
