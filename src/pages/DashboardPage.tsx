"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Target,
  Trophy,
  Clock,
  Play,
  MessageCircle,
  PenTool,
  Mic,
  TrendingUp,
  Award,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  const [user] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    currentScore: 650,
    targetScore: 850,
    level: "Trung cấp",
    streak: 15,
    totalStudyTime: 45,
  })

  const recentActivities = [
    { type: "lesson", title: "Hoàn thành bài học: Listening Part 1", time: "2 giờ trước" },
    { type: "practice", title: "Luyện tập Writing Task 1", time: "1 ngày trước" },
    { type: "test", title: "Hoàn thành Mini Test Reading", time: "2 ngày trước" },
    { type: "ai", title: "Chat với AI về ngữ pháp", time: "3 ngày trước" },
  ]

  const courses = [
    {
      title: "TOEIC Listening Mastery",
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      nextLesson: "Part 3: Conversations",
    },
    {
      title: "TOEIC Reading Strategies",
      progress: 45,
      totalLessons: 20,
      completedLessons: 9,
      nextLesson: "Part 6: Text Completion",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">STAREDU</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              <Link to="/admin">
                <Button variant="ghost" size="sm">Admin</Button>
              </Link>
              <Link to="/tests">
                <Button variant="ghost" size="sm">Quản lý Đề</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge variant="secondary">{user.level}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.currentScore}</div>
                  <div className="text-sm text-gray-600">Điểm hiện tại</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ mục tiêu</span>
                    <span>{Math.round((user.currentScore / user.targetScore) * 100)}%</span>
                  </div>
                  <Progress value={(user.currentScore / user.targetScore) * 100} />
                  <div className="text-xs text-gray-500 text-center">Mục tiêu: {user.targetScore} điểm</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-orange-600">{user.streak}</div>
                    <div className="text-xs text-gray-600">Ngày liên tiếp</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{user.totalStudyTime}h</div>
                    <div className="text-xs text-gray-600">Tổng thời gian</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Cài đặt
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="courses">Khóa học</TabsTrigger>
                <TabsTrigger value="practice">Luyện tập</TabsTrigger>
                <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Điểm cao nhất</p>
                          <p className="text-2xl font-bold">{user.currentScore}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Target className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Mục tiêu</p>
                          <p className="text-2xl font-bold">{user.targetScore}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Thời gian học</p>
                          <p className="text-2xl font-bold">{user.totalStudyTime}h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Cải thiện</p>
                          <p className="text-2xl font-bold">+85</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hoạt động gần đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Khóa học của tôi</h2>
                  <Link to="/courses">
                    <Button>Xem tất cả khóa học</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>
                          {course.completedLessons}/{course.totalLessons} bài học hoàn thành
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Tiến độ</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Bài tiếp theo:</p>
                            <p className="text-sm text-gray-600">{course.nextLesson}</p>
                          </div>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Tiếp tục
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="practice" className="space-y-6">
                <h2 className="text-2xl font-bold">Luyện tập</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle>Luyện đề theo Part</CardTitle>
                      <CardDescription>Luyện tập từng phần của đề thi TOEIC</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Bắt đầu luyện tập</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Award className="h-8 w-8 text-green-600 mb-2" />
                      <CardTitle>Full Test</CardTitle>
                      <CardDescription>Làm đề thi TOEIC hoàn chỉnh 200 câu</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Làm bài thi</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Clock className="h-8 w-8 text-orange-600 mb-2" />
                      <CardTitle>Mini Test</CardTitle>
                      <CardDescription>Bài kiểm tra ngắn 30-50 câu</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Làm Mini Test</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai-tools" className="space-y-6">
                <h2 className="text-2xl font-bold">AI Tools</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle>AI Chatbot</CardTitle>
                      <CardDescription>Hỏi đáp về từ vựng, ngữ pháp và mẹo làm bài</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Bắt đầu chat</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <PenTool className="h-8 w-8 text-green-600 mb-2" />
                      <CardTitle>AI Writing Coach</CardTitle>
                      <CardDescription>Luyện viết với AI sửa ngữ pháp và cải thiện văn phong</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Luyện Writing</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Mic className="h-8 w-8 text-purple-600 mb-2" />
                      <CardTitle>AI Speaking Partner</CardTitle>
                      <CardDescription>Luyện nói với AI và nhận phản hồi về phát âm</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Luyện Speaking</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Target className="h-8 w-8 text-red-600 mb-2" />
                      <CardTitle>Personalized Study Plan</CardTitle>
                      <CardDescription>AI tạo kế hoạch học tập cá nhân hóa</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Tạo kế hoạch</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
