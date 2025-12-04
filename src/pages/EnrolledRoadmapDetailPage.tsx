"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle2,
  Video,
  FileText,
  Award
} from "lucide-react"
import { enrollmentApi, type Enrollment } from "@/api/enrollmentApi"
import { lessonApi, type Lesson } from "@/api/lessonApi"

// Định nghĩa interface cho Course với completion_percentage
interface CourseWithProgress {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  skill_groups: string[];
  target_level?: string;
  is_published: boolean;
  total_lessons: number;
  total_duration_minutes: number;
  average_rating: number;
  total_enrollments: number;
  assigned_teachers: Array<{
    _id: string;
    name: string;
    avatar?: string;
    experience_years: number;
  }>;
  completion_percentage: number;
}

export default function EnrolledRoadmapDetailPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [courses, setCourses] = useState<CourseWithProgress[]>([])
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({})
  const [loadingLessons, setLoadingLessons] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadEnrollmentDetail()
  }, [enrollmentId])

  const loadEnrollmentDetail = async () => {
    if (!enrollmentId) return

    try {
      setLoading(true)
      
      // Load enrollment detail
      console.log('🔍 Loading enrollment:', enrollmentId)
      const enrollmentData = await enrollmentApi.getEnrollmentById(enrollmentId)
      console.log('📦 Enrollment data:', enrollmentData)
      setEnrollment(enrollmentData.data)

      // Load courses với completion percentage từ API mới
      console.log('📚 Loading courses with progress for enrollment:', enrollmentId)
      const coursesData = await enrollmentApi.getEnrollmentCourses(enrollmentId)
      console.log('✅ Courses loaded:', coursesData)
      setCourses(coursesData.data.data || [])

      setLoading(false)
    } catch (error) {
      console.error('❌ Error loading enrollment:', error)
      setLoading(false)
    }
  }

  const toggleCourse = async (courseId: string) => {
    const isExpanded = expandedCourses[courseId]
    
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !isExpanded
    }))

    // Load lessons if not loaded yet
    if (!isExpanded && !courseLessons[courseId]) {
      setLoadingLessons(prev => ({ ...prev, [courseId]: true }))
      try {
        const lessonsData = await lessonApi.getLessonsByCourseId(courseId)
        setCourseLessons(prev => ({
          ...prev,
          [courseId]: lessonsData.data.lessons
        }))
      } catch (error) {
        console.error('Error loading lessons:', error)
      } finally {
        setLoadingLessons(prev => ({ ...prev, [courseId]: false }))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">Không tìm thấy thông tin đăng ký</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {enrollment.roadmap.thumbnail ? (
              <img
                src={enrollment.roadmap.thumbnail}
                alt={enrollment.roadmap.title}
                className="w-full md:w-64 h-40 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full md:w-64 h-40 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-16 w-16" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {enrollment.roadmap.title}
              </h1>
              {enrollment.roadmap.description && (
                <p className="text-white/90 mb-4">{enrollment.roadmap.description}</p>
              )}
              
              {(enrollment.roadmap.total_courses > 0 || enrollment.roadmap.estimated_duration_weeks || enrollment.roadmap.target_level) && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {enrollment.roadmap.total_courses > 0 && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      <span>{enrollment.roadmap.total_courses} khóa học</span>
                    </div>
                  )}
                  {enrollment.roadmap.estimated_duration_weeks && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{enrollment.roadmap.estimated_duration_weeks} tuần</span>
                    </div>
                  )}
                  {enrollment.roadmap.target_level && (
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <span>Mục tiêu: {enrollment.roadmap.target_level}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Tiến độ học tập</span>
                  <span className="text-lg font-bold">{enrollment.completion_percentage}%</span>
                </div>
                <Progress 
                  value={enrollment.completion_percentage} 
                  className="h-3 bg-white/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Các khóa học trong lộ trình</h2>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {courses.length} khóa học
          </Badge>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>Chưa có khóa học nào trong lộ trình này</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {courses.map((course, index) => (
              <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Course Thumbnail */}
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full md:w-64 h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full md:w-64 h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white" />
                      </div>
                    )}

                    {/* Course Info */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-600">Khóa học {index + 1}</Badge>
                            {course.is_published && (
                              <Badge variant="outline" className="border-green-500 text-green-600">
                                Đã mở
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                          {course.description && (
                            <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.total_lessons || 0} bài học</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{course.total_duration_minutes || 0} phút</span>
                            </div>
                          </div>

                          {/* Course Progress Bar */}
                          <div className="mt-4 bg-white/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Tiến độ khóa học</span>
                              <span className="text-sm font-bold text-blue-600">{course.completion_percentage || 0}%</span>
                            </div>
                            <Progress 
                              value={course.completion_percentage || 0} 
                              className="h-2 bg-gray-200"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => toggleCourse(course._id)}
                          variant="outline"
                          size="lg"
                          className="ml-4"
                        >
                          {expandedCourses[course._id] ? 'Thu gọn' : 'Xem bài học'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {expandedCourses[course._id] && (
                  <CardContent className="pt-6">
                    {loadingLessons[course._id] ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải bài học...</p>
                      </div>
                    ) : courseLessons[course._id]?.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Danh sách bài học
                        </h4>
                        {courseLessons[course._id].map((lesson, lessonIndex) => (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                                {lessonIndex + 1}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium mb-1">{lesson.title}</h5>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Video className="h-3 w-3" />
                                    <span>{lesson.total_sections || 0} sections</span>
                                  </div>
                                  {lesson.duration_minutes && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{lesson.duration_minutes} phút</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Đã mở khóa
                              </Badge>
                              <Link to={`/courses/${course._id}?enrolled=true&lesson=${lesson._id}`}>
                                <Button size="sm">
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Học ngay
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Chưa có bài học nào</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Stats Card */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{courses.length}</div>
                <div className="text-sm text-gray-600 mt-1">Khóa học</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {courses.reduce((sum, c) => sum + (c.total_lessons || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Bài học</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {courses.reduce((sum, c) => sum + (c.total_duration_minutes || 0), 0)} phút
                </div>
                <div className="text-sm text-gray-600 mt-1">Tổng thời lượng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {enrollment.completion_percentage}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Hoàn thành</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
