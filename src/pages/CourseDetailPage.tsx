"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Star, Users, Play, ArrowLeft, CheckCircle, 
  Video, FileText, Lock, Loader2, BookOpen, Image as ImageIcon
} from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { courseApi, type Course, type Lesson, type Section } from "@/api/courseApi"

export default function CourseDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Check if accessed from enrolled roadmap
  const enrolledFromRoadmap = searchParams.get('enrolled') === 'true'
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  
  // Quiz/Exercise state
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (id) {
      fetchCourseData()
    }
  }, [id])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch course details and lessons in parallel
      const [courseResponse, lessonsResponse] = await Promise.all([
        courseApi.getCourseById(id!),
        courseApi.getCourseLessons(id!)
      ])
      
      setCourse(courseResponse.data)
      setLessons(lessonsResponse.data.lessons)
      
      // If accessed from enrolled roadmap, mark as enrolled
      const enrolled = enrolledFromRoadmap || lessonsResponse.data.is_enrolled
      setIsEnrolled(enrolled)
      
      // Auto expand first lesson or lesson from query param
      const targetLessonId = searchParams.get('lesson')
      if (lessonsResponse.data.lessons.length > 0) {
        const firstLessonId = targetLessonId || lessonsResponse.data.lessons[0]._id
        setExpandedLessons(new Set([firstLessonId]))
      }
    } catch (err: any) {
      console.error("Error fetching course:", err)
      setError(err.response?.data?.message || "Không thể tải thông tin khóa học")
    } finally {
      setLoading(false)
    }
  }

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  const handleSectionClick = async (lesson: Lesson, section: Section) => {
    const lessonData = lesson as any
    const sectionData = section as any
    
    // Check if section/lesson is locked
    const isLocked = sectionData.is_locked || lessonData.is_locked
    
    if (isLocked) {
      // Don't allow access to locked sections
      return
    }
    
    setSelectedLesson(lesson)
    setSelectedSection(section)
    // Reset quiz/exercise state when changing section
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
    setSubmitResult(null)

    // ✅ Tự động đánh dấu video và mindmap là đã xem
    const sectionType = section.type || (section as any).section_type
    if (sectionType === 'video' || sectionType === 'mindmap') {
      try {
        console.log(`🔄 Đang đánh dấu section ${section._id} (${sectionType}) là đã xem...`)
        await courseApi.markSectionViewed(section._id)
        console.log(`✅ Đã đánh dấu section ${section._id} là đã xem`)
        
        // Reload lessons để cập nhật trạng thái (sau 1s để backend xử lý)
        setTimeout(() => {
          fetchCourseData()
        }, 1000)
      } catch (err: any) {
        console.error('❌ Lỗi khi đánh dấu section đã xem:', err)
        console.error('Error details:', err.response?.data)
      }
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<any>(null)

  const handleSubmitQuiz = async () => {
    if (!selectedSection?.questions) return
    
    // Chuẩn bị answers cho API
    const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({
      question_id: questionId,
      selected_answer: typeof answer === 'number' ? answer : parseInt(answer)
    }))

    try {
      setSubmitting(true)
      
      // Gọi API submit
      const result = await courseApi.submitExercise(selectedSection._id, answers)
      setSubmitResult(result.data)
      setScore(result.data.score_percentage)
      setShowResults(true)
      
      // Nếu đạt >= 70%, refresh để cập nhật trạng thái unlock
      if (result.data.is_completed) {
        // Reload lessons để cập nhật trạng thái lock
        setTimeout(() => {
          fetchCourseData()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Error submitting quiz:", err)
      // Fallback to local calculation if API fails
      let correctCount = 0
      selectedSection.questions.forEach(q => {
        const userAnswer = userAnswers[q.id]
        if (q.questionType === 'multiple-choice') {
          if (userAnswer === q.correctAnswer) correctCount++
        } else if (q.questionType === 'fill-blank') {
          const correctAnswers = q.correctAnswers || []
          if (correctAnswers.some(ans => 
            ans.toLowerCase().trim() === String(userAnswer || '').toLowerCase().trim()
          )) {
            correctCount++
          }
        }
      })
      
      const totalQuestions = selectedSection.questions.length
      const percentage = (correctCount / totalQuestions) * 100
      setScore(percentage)
      setShowResults(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetQuiz = () => {
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
    setSubmitResult(null)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Khóa học không tồn tại"}
          </h1>
          <Link to="/courses">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách khóa học
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/courses" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại danh sách khóa học
          </Link>
        </div>

        {/* Course Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  <Badge className="bg-green-500 text-sm px-3 py-1">
                    {getSkillLabel(course.skill_groups)}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{course.average_rating.toFixed(1)}</span>
                    <span className="ml-1">({course.total_reviews} đánh giá)</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.total_enrollments.toLocaleString()} học viên
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {lessons.length} chương
                  </div>
                </div>

                {!isEnrolled && (
                  <div className="mt-6">
                    <Button size="lg" className="w-full md:w-auto">
                      <Play className="mr-2 h-5 w-5" />
                      Đăng ký khóa học ngay
                    </Button>
                  </div>
                )}
              </div>

              <div className="md:col-span-1">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player / Content Area */}
          <div className="lg:col-span-2">
            {selectedSection && selectedLesson ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedSection.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedLesson.title}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {selectedSection.video_url && <Video className="h-3 w-3 mr-1" />}
                      {selectedSection.mindmap_url && <ImageIcon className="h-3 w-3 mr-1" />}
                      {selectedSection.test_id && <FileText className="h-3 w-3 mr-1" />}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Video Content */}
                  {selectedSection.video_url && (
                    <div className="aspect-video bg-black rounded-lg mb-4">
                      <video
                        src={selectedSection.video_url}
                        controls
                        className="w-full h-full rounded-lg"
                      >
                        Trình duyệt của bạn không hỗ trợ video
                      </video>
                    </div>
                  )}

                  {/* Audio Content */}
                  {selectedSection.audioUrl && (
                    <div className="mb-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">Audio Listening</h3>
                          <audio
                            src={selectedSection.audioUrl}
                            controls
                            className="w-full"
                          >
                            Trình duyệt của bạn không hỗ trợ audio
                          </audio>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mindmap Content */}
                  {selectedSection.mindmap_url && (
                    <div className="mb-4">
                      <img
                        src={selectedSection.mindmap_url}
                        alt="Mindmap"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Article Content */}
                  {selectedSection.articleContent && (
                    <div className="mb-4 p-6 bg-white rounded-lg border">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedSection.articleContent }}
                      />
                    </div>
                  )}

                  {/* Description */}
                  {selectedSection.description && !selectedSection.questions && (
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-600">{selectedSection.description}</p>
                    </div>
                  )}

                  {/* Quiz/Exercise Content */}
                  {selectedSection.questions && selectedSection.questions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-blue-900">
                            {selectedSection.type === 'quiz' ? '📝 Bài kiểm tra' : '✍️ Bài tập thực hành'}
                          </h3>
                          <p className="text-sm text-blue-700 mt-1">
                            {selectedSection.questions.length} câu hỏi
                            {selectedSection.passingScore && ` • Điểm đạt: ${selectedSection.passingScore}%`}
                          </p>
                        </div>
                        {showResults && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${score >= (selectedSection.passingScore || 70) ? 'text-green-600' : 'text-red-600'}`}>
                              {score.toFixed(0)}%
                            </div>
                            <p className="text-sm text-gray-600">
                              {score >= (selectedSection.passingScore || 70) ? '✅ Đạt' : '❌ Chưa đạt'}
                            </p>
                            {submitResult && (
                              <p className="text-xs text-gray-500 mt-1">
                                Lần thử: {submitResult.attempts}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Success/Warning Message after submit */}
                      {showResults && submitResult && (
                        <div className={`p-4 rounded-lg ${
                          submitResult.is_completed 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-orange-50 border border-orange-200'
                        }`}>
                          <p className={`text-sm ${submitResult.is_completed ? 'text-green-700' : 'text-orange-700'}`}>
                            {submitResult.is_completed 
                              ? '🎉 Chúc mừng! Bạn đã hoàn thành bài tập và có thể mở khóa chương tiếp theo.'
                              : `⚠️ Bạn cần đạt tối thiểu ${submitResult.passing_score}% để mở khóa chương tiếp theo. Hãy thử lại!`
                            }
                          </p>
                        </div>
                      )}

                      {/* Questions */}
                      <div className="space-y-6">
                        {selectedSection.questions.map((question, index) => (
                          <div key={question.id} className="p-4 border rounded-lg bg-white">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                {/* Image for question */}
                                {question.image && (
                                  <div className="mb-4">
                                    <img
                                      src={question.image}
                                      alt={`Question ${index + 1}`}
                                      className="w-full max-w-md rounded-lg border shadow-sm"
                                    />
                                  </div>
                                )}

                                {/* Audio for question */}
                                {question.audio && (
                                  <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <Play className="h-5 w-5 text-purple-600" />
                                      <audio
                                        src={question.audio}
                                        controls
                                        className="flex-1"
                                      >
                                        Trình duyệt của bạn không hỗ trợ audio
                                      </audio>
                                    </div>
                                    {question.transcript && showResults && (
                                      <details className="mt-3">
                                        <summary className="text-sm font-medium text-purple-700 cursor-pointer hover:text-purple-900">
                                          📝 Xem transcript
                                        </summary>
                                        <p className="mt-2 text-sm text-gray-700 p-3 bg-white rounded border">
                                          {question.transcript}
                                        </p>
                                      </details>
                                    )}
                                  </div>
                                )}

                                {question.questionText && (
                                  <p className="font-medium text-gray-900 mb-3">{question.questionText}</p>
                                )}
                                
                                {question.questionType === 'multiple-choice' && question.options && (
                                  <div className="space-y-2">
                                    {question.options.map((option, optIndex) => {
                                      const isSelected = userAnswers[question.id] === optIndex
                                      const isCorrect = optIndex === question.correctAnswer
                                      
                                      return (
                                        <label
                                          key={optIndex}
                                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                            showResults
                                              ? isCorrect
                                                ? 'border-green-500 bg-green-50'
                                                : isSelected
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 bg-gray-50'
                                              : isSelected
                                              ? 'border-blue-500 bg-blue-50'
                                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={optIndex}
                                            checked={isSelected}
                                            onChange={() => !showResults && handleAnswerChange(question.id, optIndex)}
                                            disabled={showResults}
                                            className="w-4 h-4"
                                          />
                                          <span className="flex-1">{option}</span>
                                          {showResults && isCorrect && (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                          )}
                                          {showResults && isSelected && !isCorrect && (
                                            <span className="text-red-600">✗</span>
                                          )}
                                        </label>
                                      )
                                    })}
                                  </div>
                                )}

                                {question.questionType === 'fill-blank' && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={userAnswers[question.id] || ''}
                                      onChange={(e) => !showResults && handleAnswerChange(question.id, e.target.value)}
                                      disabled={showResults}
                                      placeholder="Nhập câu trả lời của bạn..."
                                      className={`w-full px-4 py-2 border-2 rounded-lg ${
                                        showResults
                                          ? question.correctAnswers?.some(ans => 
                                              ans.toLowerCase().trim() === String(userAnswers[question.id] || '').toLowerCase().trim()
                                            )
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-red-500 bg-red-50'
                                          : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                      }`}
                                    />
                                    {showResults && question.correctAnswers && (
                                      <p className="text-sm text-gray-600">
                                        <strong>Đáp án đúng:</strong> {question.correctAnswers.join(' hoặc ')}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {showResults && question.explanation && (
                                  <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <p className="text-sm text-gray-700">
                                      <strong>Giải thích:</strong> {question.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-4">
                        {!showResults ? (
                          <Button 
                            onClick={handleSubmitQuiz}
                            className="flex-1"
                            size="lg"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang chấm...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Nộp bài
                              </>
                            )}
                          </Button>
                        ) : (
                          <>
                            <Button 
                              onClick={handleResetQuiz}
                              variant="outline"
                              className="flex-1"
                              size="lg"
                            >
                              Làm lại
                            </Button>
                            <Button 
                              variant="default"
                              className="flex-1"
                              size="lg"
                            >
                              Tiếp tục
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Test ID placeholder (for future integration) */}
                  {selectedSection.test_id && !selectedSection.questions && (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Bài kiểm tra chi tiết</p>
                      <Button>
                        <Play className="mr-2 h-4 w-4" />
                        Bắt đầu làm bài
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Chào mừng đến với khóa học</CardTitle>
                  <CardDescription>
                    Chọn một bài học từ danh sách bên phải để bắt đầu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Hãy chọn một bài học để bắt đầu học tập
                    </p>
                    {!isEnrolled && (
                      <p className="text-sm text-orange-600 mt-2">
                        💡 Các bài học có biểu tượng <Lock className="inline h-4 w-4" /> yêu cầu đăng ký khóa học
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nội dung khóa học</CardTitle>
                <CardDescription>
                  {lessons.length} chương
                  {isEnrolled && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      Đã đăng ký
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const lessonData = lesson as any
                    const isExpanded = expandedLessons.has(lesson._id)
                    const isFree = lessonData.is_free
                    // If enrolled from roadmap, check lock from API response
                    const isLocked = enrolledFromRoadmap ? lessonData.is_locked : lessonData.is_locked
                    const lockReason = lessonData.lock_reason

                    return (
                      <div key={lesson._id} className="border rounded-lg">
                        <button
                          onClick={() => toggleLesson(lesson._id)}
                          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3 text-left flex-1">
                            {isLocked ? (
                              <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            ) : (enrolledFromRoadmap || isEnrolled) && index === 0 ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : isFree ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                              <p className="text-xs text-gray-500 truncate">
                                {lesson.total_sections || (lesson.sections?.length || 0)} phần
                                {isFree && <span className="ml-2 text-green-600">• Miễn phí</span>}
                                {isLocked && isEnrolled && <span className="ml-2 text-orange-600">• Đang khóa</span>}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {isExpanded ? "▼" : "▶"}
                          </div>
                        </button>

                        {/* Lock reason message */}
                        {isExpanded && isLocked && lockReason && (
                          <div className="px-3 py-2 bg-orange-50 border-t border-orange-200">
                            <p className="text-xs text-orange-700">
                              🔒 {lockReason}
                            </p>
                          </div>
                        )}

                        {isExpanded && lesson.sections && lesson.sections.length > 0 && (
                          <div className="border-t">
                            {lesson.sections.map((section) => {
                              const sectionData = section as any
                              // Section locked if lesson is locked
                              const sectionLocked = sectionData.is_locked || isLocked
                              const isSelected = selectedSection?._id === section._id
                              const sectionProgress = sectionData.progress

                              return (
                                <button
                                  key={section._id}
                                  onClick={() => handleSectionClick(lesson, section)}
                                  disabled={sectionLocked}
                                  className={`w-full p-3 pl-10 flex items-center space-x-3 text-left hover:bg-gray-50 transition-colors ${
                                    isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                  } ${sectionLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  <div className="flex-shrink-0">
                                    {sectionLocked ? (
                                      <Lock className="h-3 w-3 text-gray-400" />
                                    ) : sectionProgress?.is_completed ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : section.video_url ? (
                                      <Video className="h-3 w-3 text-blue-500" />
                                    ) : section.mindmap_url ? (
                                      <ImageIcon className="h-3 w-3 text-purple-500" />
                                    ) : section.test_id || (section as any).type === 'exercise' || (section as any).type === 'quiz' ? (
                                      <FileText className="h-3 w-3 text-orange-500" />
                                    ) : (
                                      <FileText className="h-3 w-3 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{section.title}</p>
                                    {sectionProgress && sectionProgress.is_completed && (
                                      <p className="text-xs text-green-600 font-medium">
                                        Hoàn thành ✓
                                      </p>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
