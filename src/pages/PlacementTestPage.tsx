import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, FileText, Target, CheckCircle, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import testApi from "@/api/testApi"
import type { Test } from "@/api/testApi"

export default function PlacementTestPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [test, setTest] = useState<Test | null>(null)

  useEffect(() => {
    loadPlacementTest()
  }, [])

  const loadPlacementTest = async () => {
    try {
      setLoading(true)
      setError(null)
      const placementTest = await testApi.getPlacementTest()
      setTest(placementTest)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Không thể tải bài test đầu vào')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = () => {
    if (test) {
      navigate(`/practice/test/${test._id}/full`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">STAREDU</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Đầu Vào TOEIC</h1>
          <p className="text-xl text-gray-600">Đánh giá trình độ hiện tại và nhận đề xuất khóa học phù hợp</p>
        </div>

        {loading && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Đang tải bài test...</h3>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
              <Link to="/courses">
                <Button>Xem khóa học</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {test && !loading && (
          <div className="space-y-6">
            {/* Thông tin bài test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Thông tin bài test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Badge variant="secondary">{test.source}</Badge>
                    <Badge variant="outline">Năm {test.year}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Số câu hỏi</p>
                      <p className="text-2xl font-bold text-gray-900">40 câu</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                    <Clock className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Thời gian</p>
                      <p className="text-2xl font-bold text-gray-900">{test.time_limit} phút</p>
                    </div>
                  </div>

                  
                </div>
              </CardContent>
            </Card>

            {/* Nội dung bài test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Sau khi hoàn thành
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Điểm số ước tính TOEIC (Listening + Reading)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Phân tích chi tiết từng Part (1-7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Đề xuất khóa học phù hợp với trình độ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Kế hoạch học tập cá nhân hóa</span>
                </div>
              </CardContent>
            </Card>

            {/* Hướng dẫn */}
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn làm bài</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600">📢 Listening (20 câu)</h4>
                    <ul className="text-sm text-gray-600 space-y-1 pl-4">
                      <li>• Part 1: Photographs (3 câu)</li>
                      <li>• Part 2: Question-Response (8 câu)</li>
                      <li>• Part 3: Conversations (6 câu)</li>
                      <li>• Part 4: Talks (3 câu)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">📖 Reading (20 câu)</h4>
                    <ul className="text-sm text-gray-600 space-y-1 pl-4">
                      <li>• Part 5: Incomplete Sentences (8 câu)</li>
                      <li>• Part 6: Text Completion (4 câu)</li>
                      <li>• Part 7: Reading Comprehension (8 câu)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Lưu ý:</strong> Bài test này được thiết kế để đánh giá chính xác trình độ của bạn. 
                    Hãy làm bài trong môi trường yên tĩnh và hoàn thành đúng thời gian quy định.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Button bắt đầu */}
            <div className="text-center">
              <Button 
                size="lg" 
                className="text-lg px-12 py-6"
                onClick={handleStartTest}
              >
                Bắt đầu làm bài
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
