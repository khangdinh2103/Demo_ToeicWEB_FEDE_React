import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Target, BookOpen, ArrowRight, TrendingUp, Award } from "lucide-react"
import testApi from "@/api/testApi"
import type { TestAttempt } from "@/api/testApi"

export default function PlacementTestResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const attemptId = searchParams.get("attemptId")
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)

  useEffect(() => {
    if (attemptId) {
      loadTestResult()
    }
  }, [attemptId])

  const loadTestResult = async () => {
    try {
      setLoading(true)
      const result = await testApi.getAttemptResult(attemptId!)
      setAttempt(result)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Không thể tải kết quả test')
    } finally {
      setLoading(false)
    }
  }

  const calculateToeicScore = (correctAnswers: number, totalQuestions: number) => {
    // Tính điểm TOEIC dựa trên tỷ lệ đúng
    // Placement test chuẩn: 40 câu (Listening 20 + Reading 20)
    // Mỗi section max 495 điểm -> tổng 990 điểm
    
    // Nếu không làm đúng câu nào, trả về 0
    if (correctAnswers === 0) return 0
    
    // Chuẩn hóa về thang 40 câu (nếu totalQuestions khác 40)
    // Ví dụ: nếu có 37 câu và làm đúng 20 câu
    // -> tỷ lệ: 20/37 = 54.05%
    // -> quy về 40 câu: 54.05% * 40 = 21.62 câu (trong 40)
    const normalizedCorrect = totalQuestions === 40 
      ? correctAnswers 
      : (correctAnswers / totalQuestions) * 40
    
    const percentage = (normalizedCorrect / 40) * 100
    
    // Công thức ước tính điểm TOEIC dựa trên tỷ lệ đúng
    let score = 0
    if (percentage >= 95) score = 990
    else if (percentage >= 90) score = 900
    else if (percentage >= 85) score = 850
    else if (percentage >= 80) score = 800
    else if (percentage >= 75) score = 750
    else if (percentage >= 70) score = 700
    else if (percentage >= 65) score = 650
    else if (percentage >= 60) score = 600
    else if (percentage >= 55) score = 550
    else if (percentage >= 50) score = 500
    else if (percentage >= 45) score = 450
    else if (percentage >= 40) score = 400
    else if (percentage >= 35) score = 350
    else if (percentage >= 30) score = 300
    else if (percentage >= 25) score = 250
    else if (percentage >= 20) score = 200
    else if (percentage >= 15) score = 150
    else if (percentage >= 10) score = 100
    else if (percentage >= 5) score = 50
    else score = 10 // Làm được ít nhất 1 câu
    
    return score
  }

  const getLevel = (score: number) => {
    if (score >= 800) return { name: "Cao cấp", color: "text-purple-600", bg: "bg-purple-50" }
    if (score >= 650) return { name: "Trung cấp", color: "text-blue-600", bg: "bg-blue-50" }
    if (score >= 450) return { name: "Sơ cấp", color: "text-green-600", bg: "bg-green-50" }
    return { name: "Mới bắt đầu", color: "text-orange-600", bg: "bg-orange-50" }
  }

  const getRecommendedCourse = (score: number) => {
    if (score >= 800) return "TOEIC Cao Cấp 800+ (Master Level)"
    if (score >= 650) return "TOEIC Trung Cấp 650-800"
    if (score >= 450) return "TOEIC Sơ Cấp 450-650"
    return "TOEIC Cơ Bản (Beginner)"
  }

  const getStudyPlan = (score: number) => {
    if (score >= 650) return "2-3 tháng với 1-2 giờ/ngày"
    if (score >= 450) return "3-4 tháng với 1-2 giờ/ngày"
    return "4-6 tháng với 2 giờ/ngày"
  }

  const handleGoToLearningPath = () => {
    if (attempt) {
      const score = calculateToeicScore(attempt.correct_answers || 0, attempt.total_questions)
      // Truyền điểm số qua state
      navigate("/learning-path", { 
        state: { 
          placementTestScore: score,
          correctAnswers: attempt.correct_answers,
          totalQuestions: attempt.total_questions
        } 
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Đang tải kết quả...</h3>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error || "Không tìm thấy kết quả test"}
            </div>
            <Link to="/placement-test">
              <Button>Quay lại Test Đầu Vào</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const score = calculateToeicScore(attempt.correct_answers || 0, attempt.total_questions)
  const level = getLevel(score)
  const percentage = ((attempt.correct_answers || 0) / attempt.total_questions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kết quả Test Đầu Vào</h1>
          <p className="text-xl text-gray-600">Chúc mừng! Bạn đã hoàn thành bài test đánh giá trình độ</p>
        </div>

        {/* Điểm số chính */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Điểm số ước tính TOEIC</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{score}</div>
              <div className="text-xl text-gray-600 mb-4">/ 990 điểm</div>
              <Badge className={`text-lg px-4 py-2 ${level.bg} ${level.color}`}>
                {level.name}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết kết quả</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Số câu đúng:</span>
                  <span className="text-lg font-semibold">
                    {attempt.correct_answers}/{attempt.total_questions}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Tỷ lệ đúng: {percentage.toFixed(1)}%</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Listening (20 câu):</span>
                  <span className="font-semibold">{attempt.listening_score || Math.floor(score / 2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reading (20 câu):</span>
                  <span className="font-semibold">{attempt.reading_score || Math.floor(score / 2)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian làm bài:</span>
                  <span className="font-semibold">
                    {attempt.time_used || 0} phút
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Đề xuất khóa học */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Đề xuất khóa học phù hợp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">{getRecommendedCourse(score)}</h3>
                  <p className="text-blue-700 mb-4">
                    Dựa trên kết quả test ({score} điểm), khóa học này được đề xuất phù hợp nhất với trình độ hiện tại của bạn
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                    <TrendingUp className="h-4 w-4" />
                    <strong>Thời gian học đề xuất:</strong> {getStudyPlan(score)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phân tích chi tiết */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Phân tích kết quả
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">✅ Điểm mạnh</h4>
                <ul className="space-y-2">
                  {percentage >= 70 && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Nắm vững kiến thức cơ bản
                    </li>
                  )}
                  {percentage >= 60 && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Khả năng đọc hiểu tốt
                    </li>
                  )}
                  {percentage >= 50 && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Ngữ pháp cơ bản
                    </li>
                  )}
                  {percentage < 50 && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Tiềm năng phát triển tốt
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-3">📈 Cần cải thiện</h4>
                <ul className="space-y-2">
                  {percentage < 70 && (
                    <li className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-red-600" />
                      Tăng cường luyện nghe
                    </li>
                  )}
                  {percentage < 60 && (
                    <li className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-red-600" />
                      Mở rộng vốn từ vựng
                    </li>
                  )}
                  {percentage < 50 && (
                    <li className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-red-600" />
                      Củng cố ngữ pháp cơ bản
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-red-600" />
                    Luyện tập thường xuyên
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to action */}
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-lg">Sẵn sàng bắt đầu hành trình chinh phục TOEIC?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={handleGoToLearningPath}
            >
              Xem lộ trình học phù hợp
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="text-lg px-8 w-full sm:w-auto">
                Xem tất cả khóa học
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
