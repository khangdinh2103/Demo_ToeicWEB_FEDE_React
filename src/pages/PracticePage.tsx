"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Clock, 
  Play, 
  RotateCcw, 
  Target, 
  Volume2, 
  Headphones,
  PenTool,
  Award,
  TrendingUp,
  CheckCircle
} from "lucide-react"
import { Link } from "react-router-dom"

export default function PracticePage() {
  const [selectedPart, setSelectedPart] = useState("all")

  const practiceTypes = [
    {
      id: "listening",
      title: "Luyện Listening",
      description: "Parts 1-4: Photographs, Q&A, Conversations, Talks",
      icon: Headphones,
      color: "bg-blue-500",
      parts: [
        { part: 1, name: "Photographs", questions: 6, time: "3 phút" },
        { part: 2, name: "Question-Response", questions: 25, time: "9 phút" },
        { part: 3, name: "Conversations", questions: 39, time: "17 phút" },
        { part: 4, name: "Short Talks", questions: 30, time: "13 phút" }
      ]
    },
    {
      id: "reading",
      title: "Luyện Reading",
      description: "Parts 5-7: Grammar, Text Completion, Reading Comprehension",
      icon: BookOpen,
      color: "bg-green-500",
      parts: [
        { part: 5, name: "Incomplete Sentences", questions: 30, time: "13 phút" },
        { part: 6, name: "Text Completion", questions: 16, time: "8 phút" },
        { part: 7, name: "Reading Comprehension", questions: 54, time: "54 phút" }
      ]
    }
  ]

  const fullTests = [
    {
      id: 1,
      title: "TOEIC Practice Test 1",
      difficulty: "Trung bình",
      time: "120 phút",
      questions: 200,
      attempts: 1250,
      rating: 4.8
    },
    {
      id: 2,
      title: "TOEIC Practice Test 2",
      difficulty: "Khó",
      time: "120 phút",
      questions: 200,
      attempts: 987,
      rating: 4.9
    },
    {
      id: 3,
      title: "TOEIC Practice Test 3",
      difficulty: "Dễ",
      time: "120 phút",
      questions: 200,
      attempts: 1450,
      rating: 4.7
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: "Part 5",
      score: 85,
      total: 100,
      date: "2 ngày trước",
      status: "completed"
    },
    {
      id: 2,
      type: "Full Test",
      score: 750,
      total: 990,
      date: "1 tuần trước",
      status: "completed"
    },
    {
      id: 3,
      type: "Part 3",
      score: 78,
      total: 100,
      date: "1 tuần trước",
      status: "completed"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">STAREDU</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Trang chủ
              </Link>
              <Link to="/courses" className="text-gray-700 hover:text-blue-600">
                Khóa học
              </Link>
              <Link to="/practice" className="text-blue-600 font-medium">
                Luyện tập
              </Link>
              <Link to="/ai-tools" className="text-gray-700 hover:text-blue-600">
                AI Tools
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              Trang chủ
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Luyện tập</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Luyện Tập TOEIC
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Luyện tập theo từng phần hoặc làm full test để cải thiện điểm số TOEIC của bạn
          </p>
        </div>

        <Tabs defaultValue="by-parts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="by-parts">Luyện theo Part</TabsTrigger>
            <TabsTrigger value="full-tests">Full Test</TabsTrigger>
            <TabsTrigger value="progress">Tiến độ</TabsTrigger>
          </TabsList>

          {/* Practice by Parts */}
          <TabsContent value="by-parts" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {practiceTypes.map((type) => (
                <Card key={type.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${type.color}`}>
                        <type.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{type.title}</CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {type.parts.map((part) => (
                        <div key={part.part} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Part {part.part}: {part.name}</h4>
                            <p className="text-sm text-gray-600">
                              {part.questions} câu hỏi • {part.time}
                            </p>
                          </div>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Bắt đầu
                          </Button>
                        </div>
                      ))}
                      <Button className="w-full mt-4" size="lg">
                        <Target className="mr-2 h-5 w-5" />
                        Luyện tất cả {type.title.split(' ')[1]}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Practice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5" />
                  <span>Luyện tập nhanh</span>
                </CardTitle>
                <CardDescription>
                  Chọn số câu hỏi và bắt đầu luyện tập ngay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[10, 20, 30, 50].map((count) => (
                    <Button key={count} variant="outline" className="h-16">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs">câu hỏi</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Tests */}
          <TabsContent value="full-tests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fullTests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <Badge variant={
                        test.difficulty === "Dễ" ? "secondary" :
                        test.difficulty === "Trung bình" ? "default" : "destructive"
                      }>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>
                      Test TOEIC đầy đủ 200 câu hỏi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {test.time}
                        </div>
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-2 text-gray-500" />
                          {test.questions} câu
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                          {test.attempts} lượt
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-gray-500" />
                          {test.rating}⭐
                        </div>
                      </div>
                      <Button className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Bắt đầu test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Test Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê Full Test</CardTitle>
                <CardDescription>
                  Tổng quan về kết quả các lần làm full test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
                    <div className="text-sm text-gray-600">Tests đã hoàn thành</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">720</div>
                    <div className="text-sm text-gray-600">Điểm trung bình</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">850</div>
                    <div className="text-sm text-gray-600">Điểm cao nhất</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                  <CardDescription>
                    Các bài luyện tập gần nhất của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <div className="font-medium">{activity.type}</div>
                            <div className="text-sm text-gray-600">{activity.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {activity.score}/{activity.total}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((activity.score / activity.total) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Progress by Parts */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ theo Part</CardTitle>
                  <CardDescription>
                    Mức độ thành thạo của bạn ở mỗi phần
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { part: "Part 1", score: 90, color: "bg-green-500" },
                      { part: "Part 2", score: 75, color: "bg-blue-500" },
                      { part: "Part 3", score: 65, color: "bg-yellow-500" },
                      { part: "Part 4", score: 70, color: "bg-purple-500" },
                      { part: "Part 5", score: 85, color: "bg-green-500" },
                      { part: "Part 6", score: 80, color: "bg-blue-500" },
                      { part: "Part 7", score: 72, color: "bg-yellow-500" }
                    ].map((part) => (
                      <div key={part.part}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{part.part}</span>
                          <span className="text-sm text-gray-600">{part.score}%</span>
                        </div>
                        <Progress value={part.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê tổng quan</CardTitle>
                <CardDescription>
                  Tóm tắt quá trình luyện tập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">247</div>
                    <div className="text-sm text-gray-600">Bài đã làm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">78%</div>
                    <div className="text-sm text-gray-600">Độ chính xác</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">45h</div>
                    <div className="text-sm text-gray-600">Thời gian luyện</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">+120</div>
                    <div className="text-sm text-gray-600">Điểm cải thiện</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
