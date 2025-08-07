"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Target, BookOpen, ArrowRight, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

export default function PlacementTestPage() {
  const [currentStep, setCurrentStep] = useState("intro") // intro, test, result
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes

  const questions = [
    {
      id: 1,
      type: "listening",
      question: "What is the man looking for?",
      audio: "/placeholder-audio.mp3",
      options: ["A. His keys", "B. His wallet", "C. His phone", "D. His glasses"],
      correct: "A",
    },
    {
      id: 2,
      type: "reading",
      question: "Choose the best word to complete the sentence: The meeting has been _____ until next week.",
      options: ["A. postponed", "B. advanced", "C. cancelled", "D. confirmed"],
      correct: "A",
    },
    {
      id: 3,
      type: "grammar",
      question: "Which sentence is grammatically correct?",
      options: [
        "A. She have been working here for five years.",
        "B. She has been working here for five years.",
        "C. She had been working here for five years.",
        "D. She having been working here for five years.",
      ],
      correct: "B",
    },
    // Add more questions...
  ]

  const testResult = {
    score: 520,
    level: "Trung cấp",
    strengths: ["Ngữ pháp cơ bản", "Từ vựng thông dụng"],
    weaknesses: ["Listening Part 3", "Reading comprehension"],
    recommendedCourse: "TOEIC Trung Cấp (450-650 điểm)",
    studyPlan: "3-4 tháng với 1-2 giờ/ngày",
  }

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setCurrentStep("result")
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (currentStep === "intro") {
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-6 w-6 text-blue-600 mr-2" />
                  Thông tin bài test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Số câu hỏi:</span>
                  <Badge variant="secondary">30 câu</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <Badge variant="secondary">30 phút</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kỹ năng:</span>
                  <Badge variant="secondary">Listening + Reading</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Định dạng:</span>
                  <Badge variant="secondary">Trắc nghiệm</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  Sau khi hoàn thành
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Điểm số ước tính TOEIC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Phân tích điểm mạnh/yếu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Đề xuất khóa học phù hợp</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Kế hoạch học tập cá nhân</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Hướng dẫn làm bài</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Listening (15 câu)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Nghe audio và chọn đáp án đúng</li>
                    <li>• Mỗi audio chỉ phát 1 lần</li>
                    <li>• Có thể điều chỉnh âm lượng</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Reading (15 câu)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Đọc đoạn văn và trả lời câu hỏi</li>
                    <li>• Bài tập ngữ pháp và từ vựng</li>
                    <li>• Có thể quay lại câu trước</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button size="lg" className="text-lg px-8 py-3" onClick={() => setCurrentStep("test")}>
              Bắt đầu làm bài
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "test") {
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">Test Đầu Vào TOEIC</h1>
                <Badge variant="outline">
                  Câu {currentQuestion + 1}/{questions.length}
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
                </div>
                <Progress value={progress} className="w-32" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {questions[currentQuestion].type === "listening" && "Listening"}
                  {questions[currentQuestion].type === "reading" && "Reading"}
                  {questions[currentQuestion].type === "grammar" && "Grammar"}
                </CardTitle>
                <Badge variant={questions[currentQuestion].type === "listening" ? "default" : "secondary"}>
                  {questions[currentQuestion].type.charAt(0).toUpperCase() + questions[currentQuestion].type.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions[currentQuestion].type === "listening" && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Button size="sm">▶️ Play Audio</Button>
                    <span className="text-sm text-gray-600">Click to play the audio</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4">{questions[currentQuestion].question}</h3>

                <RadioGroup
                  value={answers[currentQuestion] || ""}
                  onValueChange={handleAnswerSelect}
                  className="space-y-3"
                >
                  {questions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.charAt(0)} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Câu trước
                </Button>

                <Button onClick={nextQuestion} disabled={!answers[currentQuestion]}>
                  {currentQuestion === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "result") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kết quả Test Đầu Vào</h1>
            <p className="text-xl text-gray-600">Chúc mừng! Bạn đã hoàn thành bài test đánh giá trình độ</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Điểm số ước tính</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">{testResult.score}</div>
                <div className="text-xl text-gray-600 mb-4">/ 990 điểm</div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {testResult.level}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân tích kết quả</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Điểm mạnh:</h4>
                  <ul className="space-y-1">
                    {testResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Cần cải thiện:</h4>
                  <ul className="space-y-1">
                    {testResult.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Target className="h-4 w-4 text-red-600 mr-2" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                Đề xuất khóa học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-2">{testResult.recommendedCourse}</h3>
                <p className="text-blue-700 mb-4">
                  Dựa trên kết quả test, khóa học này phù hợp nhất với trình độ hiện tại của bạn
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-600">
                    <strong>Thời gian học đề xuất:</strong> {testResult.studyPlan}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline">Xem chi tiết</Button>
                    <Button>Đăng ký ngay</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-gray-600">Bạn có muốn tạo tài khoản để lưu kết quả và bắt đầu học ngay?</p>
            <div className="space-x-4">
              <Link to="/register">
                <Button size="lg">Đăng ký tài khoản</Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" size="lg">
                  Xem khóa học
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
