"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle,
  Lock,
  Users,
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  MapPin,
  Award,
  Video,
  FileText,
  ShoppingCart,
  Percent,
  Tag
} from "lucide-react"
import { courseApi, type Course } from "@/api/courseApi"
import { lessonApi, type Lesson } from "../api/lessonApi"
import { roadmapApi, type Roadmap } from "@/api/roadmapApi"
import { paymentApi, type PaymentGateway } from "@/api/paymentApi"
import { authApi } from "@/api/authApi"

interface LearningPathData {
  title: string
  duration: string
  courses: Array<{
    id: number
    title: string
    subtitle: string
    icon: string
    status: string
  }>
  milestones: Array<{
    name: string
    score: string
    icon: string
  }>
  currentLevel: string
  targetLevel: string
  skill: string
}

export default function LearningPathDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { roadmapId } = useParams<{ roadmapId: string }>()
  const pathData = location.state as LearningPathData | null

  const [loading, setLoading] = useState(true)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({})
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({})
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('momo')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    if (roadmapId) {
      loadRoadmapFromDB()
    } else if (!pathData) {
      navigate("/learning-path")
      return
    } else {
      loadCourses()
    }
  }, [roadmapId, pathData])

  const handleEnrollClick = () => {
    // Kiểm tra đăng nhập
    if (!authApi.isAuthenticated()) {
      alert('Vui lòng đăng nhập để đăng ký lộ trình')
      navigate('/login', { state: { returnUrl: location.pathname } })
      return
    }

    if (!roadmap) {
      alert('Chưa load được thông tin lộ trình')
      return
    }
    
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    if (!roadmap || !roadmapId) {
      alert('Không tìm thấy thông tin lộ trình')
      return
    }

    try {
      setIsProcessingPayment(true)
      
      // Redirect về dashboard tab courses sau khi thanh toán
      const redirectUrl = `${window.location.origin}/dashboard?payment=success`
      
      console.log('📤 Creating payment with:', {
        roadmap_id: roadmapId,
        gateway: selectedGateway,
        redirect_url: redirectUrl
      })
      
      // Gọi API tạo payment
      const response = await paymentApi.createPayment({
        roadmap_id: roadmapId,
        gateway: selectedGateway,
        redirect_url: redirectUrl
      })

      console.log('📥 Payment response:', response)

      // Extract payment_url from response (handle different response structures)
      const paymentData = response.data || response
      const paymentUrl = paymentData.payment_url || (paymentData as any).paymentUrl
      
      console.log('💳 Payment data:', paymentData)
      console.log('🔗 Payment URL:', paymentUrl)

      if (paymentUrl) {
        console.log('✅ Opening payment in new tab:', paymentUrl)
        
        // Lưu payment_id để verify sau
        const paymentId = paymentData.payment_id
        if (paymentId) {
          localStorage.setItem('pending_payment_id', paymentId)
          console.log('💾 Saved payment ID:', paymentId)
        }
        
        // Close modal
        setShowPaymentModal(false)
        setIsProcessingPayment(false)
        // Mở payment trong tab mới
        window.open(paymentUrl, '_blank')
        // Hiển thị thông báo
        alert('Đã mở trang thanh toán trong tab mới. Sau khi thanh toán xong, vui lòng quay lại trang này và vào Dashboard để xem khóa học.')
      } else {
        console.error('❌ Response missing payment_url:', { response, paymentData })
        throw new Error(`Không nhận được payment URL. Response: ${JSON.stringify(response)}`)
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error)
      console.error('Error response:', error.response?.data)
      alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.')
      setIsProcessingPayment(false)
    }
  }

  const loadRoadmapFromDB = async () => {
    if (!roadmapId) return
    
    try {
      setLoading(true)
      const roadmapData = await roadmapApi.getRoadmapById(roadmapId)
      console.log('Loaded roadmap:', roadmapData)
      setRoadmap(roadmapData)
      
      // Load full course details for roadmap courses
      if (roadmapData.courses && roadmapData.courses.length > 0) {
        const courseIds = roadmapData.courses.map(c => c._id)
        console.log('Loading courses IDs:', courseIds)
        console.log('Total courses to load:', courseIds.length)
        
        const coursePromises = courseIds.map((id, index) => 
          courseApi.getCourseById(id)
            .then(response => {
              console.log(`✓ Course ${index + 1} loaded:`, id, response.data?.title)
              return response
            })
            .catch(err => {
              console.error(`✗ Error loading course ${index + 1} (${id}):`, err.response?.data || err.message)
              return null
            })
        )
        
        const coursesResponses = await Promise.all(coursePromises)
        console.log('All responses:', coursesResponses)
        
        // Extract data from response wrapper
        const validCourses = coursesResponses
          .filter(response => response !== null)
          .map(response => response!.data) as Course[]
        
        console.log(`✓ Successfully loaded ${validCourses.length}/${courseIds.length} courses`)
        console.log('Valid courses:', validCourses.map(c => ({ id: c._id, title: c.title })))
        
        setFilteredCourses(validCourses)
      }
    } catch (error) {
      console.error("Error loading roadmap:", error)
      // Don't navigate away, show error instead
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await courseApi.getCourses({
        limit: 100,
        is_published: true
      })
      
      // Filter và sắp xếp courses theo lộ trình
      if (pathData) {
        const filtered = filterAndSortCourses(response.data.data, pathData)
        setFilteredCourses(filtered)
        
        // Mở rộng chặng đầu tiên mặc định
        setExpandedStages({ 1: true })
      }
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStage = (stageNum: number) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageNum]: !prev[stageNum]
    }))
  }

  const toggleCourse = async (courseId: string) => {
    const isExpanded = expandedCourses[courseId]
    
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }))

    // Load lessons nếu chưa có
    if (!isExpanded && !courseLessons[courseId]) {
      try {
        const response = await lessonApi.getLessonsByCourseId(courseId)
        setCourseLessons(prev => ({
          ...prev,
          [courseId]: response.data.lessons
        }))
      } catch (error) {
        console.error("Error loading lessons:", error)
      }
    }
  }

  const filterAndSortCourses = (allCourses: Course[], path: LearningPathData): Course[] => {
    // Map stage titles to course keywords
    const stageKeywords: Record<number, string[]> = {}
    
    path.courses.forEach((stage, index) => {
      const stageNum = index + 1
      
      // Extract keywords from stage subtitle
      if (stage.subtitle.includes("450")) {
        stageKeywords[stageNum] = ["450", "cơ bản", "co ban", "basic", "beginner", "căn bản", "[level:beginner]", "[target:450]"]
      } else if (stage.subtitle.includes("550")) {
        stageKeywords[stageNum] = ["550", "650", "trung cấp", "trung cap", "intermediate", "[target:550]", "[target:650]"]
      } else if (stage.subtitle.includes("800")) {
        stageKeywords[stageNum] = ["800", "cao cấp", "cao cap", "master", "advanced", "[target:800]"]
      } else if (stage.subtitle.includes("100") && path.skill === "speaking-writing") {
        stageKeywords[stageNum] = ["100", "speaking", "writing", "sw", "[target:100]"]
      } else if (stage.subtitle.includes("200") && path.skill === "speaking-writing") {
        stageKeywords[stageNum] = ["200", "speaking", "writing", "sw", "[target:200]"]
      } else if (stage.subtitle.includes("300") && path.skill === "speaking-writing") {
        stageKeywords[stageNum] = ["300", "speaking", "writing", "sw", "[target:300]"]
      }
    })

    // Group courses by stage
    const coursesByStage: Record<number, Course[]> = {}
    
    allCourses.forEach(course => {
      const lowerTitle = course.title.toLowerCase()
      const lowerDesc = course.description?.toLowerCase() || ""
      
      // Check which stage this course belongs to
      for (const [stageNum, keywords] of Object.entries(stageKeywords)) {
        const num = parseInt(stageNum)
        if (keywords.some(keyword => 
          lowerTitle.includes(keyword.toLowerCase()) || 
          lowerDesc.includes(keyword.toLowerCase())
        )) {
          if (!coursesByStage[num]) {
            coursesByStage[num] = []
          }
          coursesByStage[num].push(course)
          break // Course only belongs to one stage
        }
      }
    })

    // Flatten courses in stage order
    const sortedCourses: Course[] = []
    path.courses.forEach((_stage, index) => {
      const stageNum = index + 1
      if (coursesByStage[stageNum]) {
        // Sort courses within stage by order field
        const stageCourses = coursesByStage[stageNum].sort((a, b) => a.order - b.order)
        sortedCourses.push(...stageCourses)
      }
    })

    return sortedCourses
  }

  const getStageForCourse = (course: Course): number => {
    if (!pathData) return 1
    
    const lowerTitle = course.title.toLowerCase()
    
    for (let i = 0; i < pathData.courses.length; i++) {
      const stage = pathData.courses[i]
      const stageKeywords = stage.subtitle.toLowerCase()
      
      if (stageKeywords.includes("450") && (lowerTitle.includes("450") || lowerTitle.includes("cơ bản") || lowerTitle.includes("basic"))) {
        return i + 1
      } else if (stageKeywords.includes("550") && (lowerTitle.includes("550") || lowerTitle.includes("650") || lowerTitle.includes("trung cấp"))) {
        return i + 1
      } else if (stageKeywords.includes("800") && (lowerTitle.includes("800") || lowerTitle.includes("cao cấp") || lowerTitle.includes("master"))) {
        return i + 1
      }
    }
    
    return 1
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lộ trình...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if no roadmap or pathData available
  if (!roadmap && !pathData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Không tìm thấy lộ trình</p>
            <Button onClick={() => navigate("/learning-path")}>
              Quay lại trang lộ trình
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tính tổng số khóa học
  const totalCourses = filteredCourses.length

  // Tính tổng giá trị và giá combo (giảm 50%)
  const totalOriginalPrice = filteredCourses.reduce((sum, course) => sum + (course.original_price || course.price), 0)
  const totalCurrentPrice = filteredCourses.reduce((sum, course) => sum + course.price, 0)
  const comboPrice = totalCurrentPrice * 0.5 // Giảm 50%
  const comboDiscount = totalCurrentPrice - comboPrice

  // Use roadmap data if available, otherwise use pathData
  const displayTitle = roadmap?.title || pathData?.title || "Lộ trình học"

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lộ trình...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/learning-path")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Lộ trình học
          </Button>

          {/* Roadmap Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{displayTitle}</h1>

          {/* Overview Stats - PrepEdu Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {roadmap ? '1 lộ trình' : `${pathData?.courses.length || 0} chặng`}
                </div>
                <p className="text-gray-600">Gồm {totalCourses} khóa học</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {pathData?.duration || '6-12 tháng'}
                </div>
                <p className="text-gray-600">Sử dụng lộ trình</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {roadmap?.target_score || pathData?.milestones?.[0]?.score || '450+'} điểm
                </div>
                <p className="text-gray-600">Cam kết mục tiêu đầu ra</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Roadmap Description (for database roadmaps) */}
        {roadmap && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-3">Giới thiệu lộ trình</h3>
              <p className="text-gray-700 whitespace-pre-line">{roadmap.description}</p>
              <div className="flex gap-2 mt-4">
                {roadmap.skill_groups?.map(skill => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses List for Roadmap */}
        {roadmap && filteredCourses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Các khóa học trong lộ trình</h2>
            {filteredCourses.map((course, courseIndex) => {
              const isCourseExpanded = expandedCourses[course._id]
              const lessons = courseLessons[course._id] || []
              
              return (
                <Card key={course._id} className="bg-white border-2 border-gray-200 overflow-hidden">
                  {/* Course Header */}
                  <div 
                    className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 cursor-pointer hover:bg-gray-100 transition-colors border-b-2 border-gray-200"
                    onClick={() => toggleCourse(course._id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Course Thumbnail */}
                      <div className="flex-shrink-0">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-32 h-20 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.currentTarget.src = 'https://via.placeholder.com/320x200?text=Course+Image'
                            }}
                          />
                        ) : (
                          <div className="w-32 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <BookOpen className="h-10 w-10 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {/* Course Number Badge */}
                          <Badge className="bg-blue-600 text-white text-xs px-2 py-1 flex-shrink-0">
                            Khóa học {courseIndex + 1}
                          </Badge>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {course.description?.replace(/\[LEVEL:.*?\]/g, '').replace(/\[TARGET:.*?\]/g, '').trim()}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.total_enrollments || 0} học viên</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{course.average_rating?.toFixed(1) || "5.0"}</span>
                          </div>
                          {course.is_free ? (
                            <Badge className="bg-green-500 text-white">Miễn phí</Badge>
                          ) : (
                            <Badge className="bg-orange-500 text-white">
                              {formatPrice(course.price)}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            {isCourseExpanded ? (
                              <>
                                <span className="text-xs mr-1">Thu gọn</span>
                                <ChevronUp className="h-5 w-5" />
                              </>
                            ) : (
                              <>
                                <span className="text-xs mr-1">Xem chi tiết</span>
                                <ChevronDown className="h-5 w-5" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Content - Lessons */}
                  {isCourseExpanded && (
                    <CardContent className="p-5 bg-white">
                      {lessons.length > 0 ? (
                        <div className="space-y-3">
                          {lessons.map((lesson, lessonIndex) => {
                            // Sử dụng is_free từ backend để xác định lesson miễn phí
                            const isFreeLesson = lesson.is_free || false
                            const isLocked = !isFreeLesson && !course.is_free
                            
                            return (
                              <div 
                                key={lesson._id}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors border ${
                                  isLocked 
                                    ? 'bg-gray-50 border-gray-300 opacity-75' 
                                    : 'hover:bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                                  isLocked 
                                    ? 'bg-gray-200 text-gray-500' 
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {isLocked ? <Lock className="h-4 w-4" /> : lessonIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-semibold mb-1 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                                      {lesson.title}
                                    </h4>
                                    {isFreeLesson && (
                                      <Badge className="bg-green-500 text-white text-xs">Xem thử miễn phí</Badge>
                                    )}
                                    {isLocked && (
                                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                        Cần mua khóa học
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Video className="h-3 w-3" />
                                      <span>Bài học</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{lesson.duration_minutes || 10} phút</span>
                                    </div>
                                  </div>
                                </div>
                                {isLocked ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // TODO: Navigate to course purchase page
                                      navigate(`/courses/${course._id}`)
                                    }}
                                  >
                                    <Lock className="h-4 w-4 mr-1" />
                                    Mua khóa học
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/courses/${course._id}`)
                                    }}
                                  >
                                    <Play className="h-4 w-4 mr-1" />
                                    {isFreeLesson ? 'Xem thử' : 'Học ngay'}
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>Đang tải nội dung bài học...</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Learning Path Stages - PrepEdu Style (for generated paths) */}
        {pathData && !roadmap && (
          <div className="space-y-6">
            {pathData.courses.map((stage, stageIndex) => {
            const stageNum = stageIndex + 1
            const stageCourses = filteredCourses.filter(course => getStageForCourse(course) === stageNum)
            const isExpanded = expandedStages[stageNum]
            
            return (
              <Card key={stage.id} className="overflow-hidden shadow-lg border-2 border-gray-200">
                {/* Stage Header - Clickable */}
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all"
                  onClick={() => toggleStage(stageNum)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                        {stageNum}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{stage.title}</h2>
                        <p className="text-white/90">{stage.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-white/20 backdrop-blur-sm text-white text-base px-4 py-2">
                        {stageCourses.length} bài học - {stageCourses.reduce((sum, c) => sum + (c.total_enrollments || 0), 0)} bài kiểm tra
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-6 w-6" />
                      ) : (
                        <ChevronDown className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Stage Content - Expandable */}
                {isExpanded && (
                  <CardContent className="p-6 bg-gray-50">
                    {stageCourses.length > 0 ? (
                      <div className="space-y-4">
                        {stageCourses.map((course, courseIndex) => {
                          const isCourseExpanded = expandedCourses[course._id]
                          const lessons = courseLessons[course._id] || []
                          
                          return (
                            <Card key={course._id} className="bg-white border-2 border-gray-200 overflow-hidden">
                              {/* Course Header */}
                              <div 
                                className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 cursor-pointer hover:bg-gray-100 transition-colors border-b-2 border-gray-200"
                                onClick={() => toggleCourse(course._id)}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Course Number */}
                                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">
                                    {courseIndex + 1}
                                  </div>
                                  
                                  {/* Course Info */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                      {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                      {course.description?.replace(/\[LEVEL:.*?\]/g, '').replace(/\[TARGET:.*?\]/g, '').trim()}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{course.total_enrollments || 0} học viên</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span>{course.average_rating?.toFixed(1) || "5.0"}</span>
                                      </div>
                                      {course.is_free ? (
                                        <Badge className="bg-green-500 text-white">Miễn phí</Badge>
                                      ) : (
                                        <Badge className="bg-orange-500 text-white">
                                          {formatPrice(course.price)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Expand Icon */}
                                  <div className="flex-shrink-0">
                                    {isCourseExpanded ? (
                                      <ChevronUp className="h-6 w-6 text-gray-600" />
                                    ) : (
                                      <ChevronDown className="h-6 w-6 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Course Lessons - Expandable */}
                              {isCourseExpanded && (
                                <div className="p-5 bg-white">
                                  {lessons.length > 0 ? (
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                        Chi tiết {lessons.length} bài học
                                      </h4>
                                      {lessons.map((lesson) => (
                                        <div 
                                          key={lesson._id}
                                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                          {/* Lesson Icon */}
                                          <div className="flex-shrink-0 mt-0.5">
                                            {lesson.is_free ? (
                                              <Play className="h-5 w-5 text-green-600" />
                                            ) : (
                                              <Lock className="h-5 w-5 text-gray-400" />
                                            )}
                                          </div>
                                          
                                          {/* Lesson Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1">
                                                <h5 className="font-medium text-gray-900 mb-1">
                                                  {lesson.title}
                                                </h5>
                                                <p className="text-sm text-gray-600 line-clamp-1">
                                                  {lesson.description}
                                                </p>
                                              </div>
                                              {lesson.duration_minutes && (
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                  {lesson.duration_minutes} phút
                                                </span>
                                              )}
                                            </div>
                                            
                                            {/* Lesson Stats */}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                              <span className="flex items-center gap-1">
                                                <Video className="h-3 w-3" />
                                                {lesson.total_sections} sections
                                              </span>
                                              {lesson.is_free && (
                                                <Badge className="bg-green-100 text-green-700 text-xs">
                                                  Xem thử
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-gray-500">
                                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                      <p>Đang tải nội dung bài học...</p>
                                    </div>
                                  )}
                                  
                                  {/* View Course Detail Button */}
                                  <Button 
                                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/courses/${course._id}`)
                                    }}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Xem thử video bài giảng
                                  </Button>
                                </div>
                              )}
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Chưa có khóa học cho chặng này</p>
                        <p className="text-sm text-gray-500 mt-2">Khóa học đang được cập nhật</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
          </div>
        )}

        {/* Combo Price Section */}
        <Card className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl border-4 border-yellow-300">
          <CardContent className="py-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Tag className="h-8 w-8 text-yellow-300" />
              <Badge className="bg-yellow-300 text-orange-600 text-lg px-4 py-1 font-bold">
                {roadmap ? `GIẢM GIÁ ${roadmap.discount_percentage}%` : 'GIẢM GIÁ ĐẶC BIỆT 50%'}
              </Badge>
              <Percent className="h-8 w-8 text-yellow-300" />
            </div>
            
            <h2 className="text-4xl font-bold mb-3 text-center">
              {roadmap ? 'Đăng ký lộ trình ngay!' : 'Mua Combo Lộ Trình - Tiết Kiệm Ngay!'}
            </h2>
            
            <p className="text-white/95 text-lg text-center mb-6 max-w-3xl mx-auto">
              Đăng ký trọn bộ <strong>{totalCourses} khóa học</strong> trong lộ trình này và nhận ngay ưu đãi {roadmap ? (
                <>giảm <strong>{roadmap.discount_percentage}%</strong></>
              ) : (
                <>giảm <strong>50%</strong></>
              )}!
            </p>

            {/* Price Comparison */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
              {roadmap ? (
                // Roadmap pricing
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Price */}
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-2">Giá gốc:</p>
                      <p className="text-2xl font-bold line-through text-white/60">
                        {formatPrice(roadmap.price)}
                      </p>
                    </div>

                    {/* Discounted Price */}
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-2">Giá sau giảm:</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(roadmap.price * (1 - roadmap.discount_percentage / 100))}
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
                        {formatPrice(roadmap.price * (1 - roadmap.discount_percentage / 100))}
                      </p>
                      {roadmap.discount_percentage > 0 && (
                        <Badge className="bg-yellow-300 text-red-600 text-xl px-3 py-1 font-bold animate-pulse">
                          -{roadmap.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                    {roadmap.discount_percentage > 0 && (
                      <p className="text-green-300 text-lg font-semibold mt-3">
                        Tiết kiệm: {formatPrice(roadmap.price * roadmap.discount_percentage / 100)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                // Generated path combo pricing
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Price */}
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-2">Giá gốc tổng:</p>
                      <p className="text-2xl font-bold line-through text-white/60">
                        {formatPrice(totalOriginalPrice)}
                      </p>
                    </div>

                    {/* Current Price */}
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-2">Giá hiện tại:</p>
                      <p className="text-2xl font-bold line-through text-white/70">
                        {formatPrice(totalCurrentPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t-2 border-white/30 my-4"></div>

                  {/* Combo Price */}
                  <div className="text-center">
                    <p className="text-yellow-300 text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      GIÁ COMBO CHỈ CÒN:
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-5xl font-black text-white drop-shadow-lg">
                        {formatPrice(comboPrice)}
                      </p>
                      <Badge className="bg-yellow-300 text-red-600 text-xl px-3 py-1 font-bold animate-pulse">
                        -50%
                      </Badge>
                    </div>
                    <p className="text-green-300 text-lg font-semibold mt-3">
                      Tiết kiệm: {formatPrice(comboDiscount)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                className="bg-yellow-400 text-orange-600 hover:bg-yellow-300 text-xl font-bold px-10 py-7 shadow-2xl hover:scale-105 transition-transform"
                onClick={handleEnrollClick}
              >
                <ShoppingCart className="h-6 w-6 mr-2" />
                {roadmap ? 'ĐĂNG KÝ NGAY' : 'MUA COMBO NGAY'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-3 border-white text-white hover:bg-white/10 text-lg px-8 py-7"
                onClick={() => {
                  if (filteredCourses.length > 0) {
                    navigate(`/courses/${filteredCourses[0]._id}`)
                  }
                }}
              >
                <Play className="h-5 w-5 mr-2" />
                Xem thử khóa học
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center gap-8 mt-8 flex-wrap">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Cam kết hoàn tiền</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Học mọi lúc mọi nơi</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Chứng chỉ hoàn thành</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateway Selection Modal */}
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

                {roadmap && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Lộ trình:</span>
                      <span className="font-semibold">{roadmap.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(roadmap.price * (1 - roadmap.discount_percentage / 100))}
                      </span>
                    </div>
                  </div>
                )}

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

        {/* Additional Info Section - Only for generated paths */}
        {pathData && !roadmap && (
          <>
            <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
              <CardContent className="py-8 text-center">
                <Award className="h-12 w-12 mx-auto mb-3 text-white/90" />
                <h3 className="text-2xl font-bold mb-2">
                  Hoàn thành lộ trình - Đạt mục tiêu {pathData.milestones[0]?.score}
                </h3>
                <p className="text-white/90 text-base max-w-2xl mx-auto">
                  Chỉ trong <strong>{pathData.duration}</strong>, bạn sẽ nâng cao trình độ từ <strong>{pathData.currentLevel}</strong> lên <strong>{pathData.targetLevel}</strong>
                </p>
              </CardContent>
            </Card>

            {/* Achievement Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-green-50 border-2 border-green-200">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-900 mb-1">Chứng chỉ hoàn thành</h4>
                  <p className="text-sm text-green-700">Được cấp sau khi hoàn tất</p>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-2 border-purple-200">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-purple-900 mb-1">Nâng cao kỹ năng</h4>
                  <p className="text-sm text-purple-700">Cải thiện đáng kể trình độ</p>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 border-2 border-orange-200">
                <CardContent className="pt-6 text-center">
                  <Target className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-orange-900 mb-1">Đạt mục tiêu</h4>
                  <p className="text-sm text-orange-700">{pathData.milestones[0]?.score}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
