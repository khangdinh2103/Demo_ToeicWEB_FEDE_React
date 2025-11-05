"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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
  const pathData = location.state as LearningPathData | null

  const [loading, setLoading] = useState(true)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({})
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({})

  useEffect(() => {
    if (!pathData) {
      navigate("/learning-path")
      return
    }
    loadCourses()
  }, [pathData])

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

  if (!pathData) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải khóa học...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{pathData.title}</h1>

          {/* Overview Stats - PrepEdu Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {pathData.courses.length} chặng
                </div>
                <p className="text-gray-600">Gồm {totalCourses} khóa học nhỏ</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {pathData.duration}
                </div>
                <p className="text-gray-600">Sử dụng lộ trình</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {pathData.milestones[0]?.score}
                </div>
                <p className="text-gray-600">Cam kết mục tiêu đầu ra</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning Path Stages - PrepEdu Style */}
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

        {/* Combo Price Section */}
        <Card className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl border-4 border-yellow-300">
          <CardContent className="py-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Tag className="h-8 w-8 text-yellow-300" />
              <Badge className="bg-yellow-300 text-orange-600 text-lg px-4 py-1 font-bold">
                GIẢM GIÁ ĐẶC BIỆT 50%
              </Badge>
              <Percent className="h-8 w-8 text-yellow-300" />
            </div>
            
            <h2 className="text-4xl font-bold mb-3 text-center">
              Mua Combo Lộ Trình - Tiết Kiệm Ngay!
            </h2>
            
            <p className="text-white/95 text-lg text-center mb-6 max-w-3xl mx-auto">
              Đăng ký trọn bộ <strong>{totalCourses} khóa học</strong> trong lộ trình này và nhận ngay ưu đãi giảm <strong>50%</strong>!
            </p>

            {/* Price Comparison */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
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
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                className="bg-yellow-400 text-orange-600 hover:bg-yellow-300 text-xl font-bold px-10 py-7 shadow-2xl hover:scale-105 transition-transform"
                onClick={() => {
                  // TODO: Navigate to checkout with combo
                  alert(`Mua combo ${totalCourses} khóa học với giá ${formatPrice(comboPrice)}`)
                }}
              >
                <ShoppingCart className="h-6 w-6 mr-2" />
                MUA COMBO NGAY
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

        {/* Additional Info Section */}
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
      </div>
    </div>
  )
}
