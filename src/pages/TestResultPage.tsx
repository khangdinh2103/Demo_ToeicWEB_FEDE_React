"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy,
  Clock,
  Target,
  TrendingUp,
  ChevronLeft,
  RotateCcw,
  FileText,
  Share2
} from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { testApi, type TestAttempt } from "@/api/testApi"

export default function TestResultPage() {
  const { testId } = useParams()
  const [searchParams] = useSearchParams()
  const attemptId = searchParams.get('attemptId')
  
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (attemptId) {
      fetchResult()
    } else {
      setError('Không tìm thấy attemptId')
      setLoading(false)
    }
  }, [attemptId])

  const fetchResult = async () => {
    try {
      setLoading(true)
      const data = await testApi.getAttemptResult(attemptId!)
      setAttempt(data)
      console.log('Attempt result:', data)
    } catch (error) {
      console.error('Error fetching result:', error)
      setError('Không thể tải kết quả bài thi')
    } finally {
      setLoading(false)
    }
  }

  const getScoreLevel = (score: number) => {
    if (score >= 860) return "Xuất sắc"
    if (score >= 730) return "Tốt"
    if (score >= 470) return "Trung bình"
    return "Cần cải thiện"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Không tìm thấy kết quả'}</p>
            <Link to="/practice">
              <Button>Quay lại trang luyện tập</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const result = {
    testTitle: (attempt.test_id as any)?.title || "TOEIC Practice Test",
    totalQuestions: attempt.answers.length, // Số câu thực tế làm, không phải total_questions từ test
    correctAnswers: attempt.correct_answers || 0,
    listeningScore: attempt.listening_score || 0,
    readingScore: attempt.reading_score || 0,
    totalScore: attempt.total_score || 0,
    timeUsed: attempt.time_used || 0,
    completedAt: attempt.completed_at 
      ? new Date(attempt.completed_at).toLocaleDateString('vi-VN')
      : new Date().toLocaleDateString('vi-VN'),
    partResults: [
      {
        part: 0,
        correct: attempt.correct_answers || 0,
        total: attempt.answers.length,
        percentage: attempt.answers.length > 0 
          ? Math.round(((attempt.correct_answers || 0) / attempt.answers.length) * 100)
          : 0
      }
    ] // Tạm thời hiển thị tổng thể, không chia theo part
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/practice">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Quay lại
                </Button>
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Kết quả</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Xuất PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
              <h1 className="text-3xl font-bold mb-2">Chúc mừng!</h1>
              <p className="text-blue-100 mb-6">Bạn đã hoàn thành bài thi</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm text-blue-100 mb-1">Tổng điểm</div>
                  <div className="text-5xl font-bold">{result.totalScore}</div>
                  <div className="text-sm text-blue-100 mt-1">/990</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm text-blue-100 mb-1">Listening</div>
                  <div className="text-5xl font-bold">{result.listeningScore}</div>
                  <div className="text-sm text-blue-100 mt-1">/495</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm text-blue-100 mb-1">Reading</div>
                  <div className="text-5xl font-bold">{result.readingScore}</div>
                  <div className="text-sm text-blue-100 mt-1">/495</div>
                </div>
              </div>

              <div className="mt-6">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {getScoreLevel(result.totalScore)}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="text-2xl font-bold text-gray-900">
                  {result.correctAnswers}/{result.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Câu đúng</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Độ chính xác</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="text-2xl font-bold text-gray-900">
                  {result.timeUsed}
                </div>
                <div className="text-sm text-gray-600">Phút</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="text-2xl font-bold text-gray-900">
                  {result.completedAt}
                </div>
                <div className="text-sm text-gray-600">Ngày làm</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part-by-Part Results */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Kết quả chi tiết theo Part</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.partResults.map(part => (
                <div key={part.part} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {part.part === 0 ? 'Tổng thể' : `Part ${part.part}`}
                      </Badge>
                      <span className="font-medium">
                        {part.correct}/{part.total} câu đúng
                      </span>
                    </div>
                    <span className={`font-bold ${
                      part.percentage >= 80 ? 'text-green-600' :
                      part.percentage >= 60 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {part.percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={part.percentage} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/practice/test/${testId}/full`} className="block">
            <Button variant="outline" className="w-full h-24" size="lg">
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Làm lại bài thi</div>
              </div>
            </Button>
          </Link>
          
          <Link to={`/practice/test/${testId}/review?attemptId=${attemptId}`} className="block">
            <Button variant="default" className="w-full h-24" size="lg">
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Xem đáp án chi tiết</div>
              </div>
            </Button>
          </Link>

          <Link to="/practice" className="block">
            <Button variant="outline" className="w-full h-24" size="lg">
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Chọn đề khác</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
