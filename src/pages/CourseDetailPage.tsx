"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  BookOpen, Clock, Star, Users, Play, ArrowLeft, CheckCircle, 
  Video, FileText, Award, Target, Calendar, Download,
  PlayCircle, Pause, Volume2, VolumeX, Settings, Maximize
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import VideoPlayer from "@/components/VideoPlayer"
import ExercisePlayer from "@/components/ExercisePlayer"
import CourseOverview from "@/components/CourseOverview"

// Mock data cho khóa học
const courseData = {
  "1": {
    id: 1,
    title: "TOEIC Cơ Bản",
    target: "300-450 điểm",
    price: "299,000đ",
    originalPrice: "399,000đ",
    lessons: 24,
    duration: "2 tháng",
    students: 1234,
    rating: 4.8,
    image: "/placeholder.svg?height=400&width=600",
    description: "Khóa học dành cho người mới bắt đầu với TOEIC, cung cấp nền tảng vững chắc về ngữ pháp, từ vựng và kỹ năng làm bài cơ bản.",
    features: ["Video bài giảng chi tiết", "Bài tập thực hành", "Test mini hàng tuần", "Hỗ trợ AI 24/7"],
    instructor: {
      name: "Thầy Nguyễn Văn A",
      title: "Chuyên gia TOEIC 10+ năm kinh nghiệm",
      avatar: "/placeholder-user.jpg",
      bio: "Thầy có hơn 10 năm kinh nghiệm giảng dạy TOEIC, đã giúp hơn 5000 học viên đạt điểm mục tiêu."
    }
  },
  "2": {
    id: 2,
    title: "TOEIC Trung Cấp",
    target: "450-650 điểm",
    price: "499,000đ",
    originalPrice: "699,000đ",
    lessons: 36,
    duration: "3 tháng",
    students: 987,
    rating: 4.9,
    image: "/placeholder.svg?height=400&width=600",
    description: "Nâng cao kỹ năng và chiến lược làm bài cho những ai đã có nền tảng cơ bản về TOEIC.",
    features: ["Chiến lược làm bài nâng cao", "Luyện từng phần chi tiết", "Mock test hàng tuần", "Chấm bài tự động"],
    instructor: {
      name: "Cô Trần Thị B",
      title: "Thạc sĩ Ngôn ngữ Anh",
      avatar: "/placeholder-user.jpg",
      bio: "Cô có bằng Thạc sĩ Ngôn ngữ Anh và 8 năm kinh nghiệm giảng dạy TOEIC chuyên nghiệp."
    }
  },
  "3": {
    id: 3,
    title: "TOEIC Nâng Cao",
    target: "750-900+ điểm",
    price: "699,000đ",
    originalPrice: "999,000đ",
    lessons: 48,
    duration: "4 tháng",
    students: 654,
    rating: 4.9,
    image: "/placeholder.svg?height=400&width=600",
    description: "Khóa học dành cho những ai muốn đạt điểm cao và hoàn thiện kỹ năng TOEIC.",
    features: ["Chiến lược chuyên sâu", "Mock test thực tế", "Phân tích chi tiết", "Bảo đảm kết quả"],
    instructor: {
      name: "Thầy Lê Văn C",
      title: "Giám đốc học thuật TOEIC",
      avatar: "/placeholder-user.jpg",
      bio: "Thầy là chuyên gia hàng đầu về TOEIC với điểm số 990 và hơn 15 năm kinh nghiệm."
    }
  }
}

// Mock data cho curriculum
const curriculumData = {
  "1": [
    {
      id: 1,
      title: "Tuần 1: Làm quen với TOEIC",
      description: "Hiểu cấu trúc đề thi và các dạng câu hỏi cơ bản",
      lessons: [
        {
          id: 1,
          title: "Giới thiệu về đề thi TOEIC",
          type: "video",
          duration: "15:30",
          completed: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 2,
          title: "Cấu trúc Part 1 - Photographs",
          type: "video",
          duration: "20:45",
          completed: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 3,
          title: "Bài tập thực hành Part 1",
          type: "exercise",
          questions: 10,
          completed: false
        },
        {
          id: 4,
          title: "Từ vựng cơ bản - Workplace",
          type: "video",
          duration: "18:20",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
      ]
    },
    {
      id: 2,
      title: "Tuần 2: Listening Skills",
      description: "Phát triển kỹ năng nghe hiểu và strategies cho Part 1-2",
      lessons: [
        {
          id: 5,
          title: "Chiến lược làm Part 2 - Question-Response",
          type: "video",
          duration: "25:10",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 6,
          title: "Luyện nghe với native speakers",
          type: "video",
          duration: "30:00",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 7,
          title: "Bài tập Part 1 & 2 tổng hợp",
          type: "exercise",
          questions: 20,
          completed: false
        }
      ]
    },
    {
      id: 3,
      title: "Tuần 3: Reading Foundation",
      description: "Xây dựng nền tảng đọc hiểu và ngữ pháp cơ bản",
      lessons: [
        {
          id: 8,
          title: "Part 5 - Incomplete Sentences Overview",
          type: "video",
          duration: "22:15",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 9,
          title: "Ngữ pháp cơ bản - Tenses",
          type: "video",
          duration: "28:30",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 10,
          title: "Thực hành Part 5",
          type: "exercise",
          questions: 15,
          completed: false
        }
      ]
    }
  ],
  "2": [
    {
      id: 1,
      title: "Tuần 1: Advanced Listening Strategies",
      description: "Chiến lược nâng cao cho Part 3-4",
      lessons: [
        {
          id: 1,
          title: "Part 3 - Conversations Deep Dive",
          type: "video",
          duration: "35:20",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 2,
          title: "Note-taking Techniques",
          type: "video",
          duration: "20:15",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 3,
          title: "Advanced Part 3 Practice",
          type: "exercise",
          questions: 30,
          completed: false
        }
      ]
    },
    {
      id: 2,
      title: "Tuần 2: Reading Comprehension Mastery",
      description: "Thành thạo kỹ năng đọc hiểu Part 6-7",
      lessons: [
        {
          id: 4,
          title: "Part 6 - Text Completion Strategies",
          type: "video",
          duration: "28:45",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 5,
          title: "Part 7 - Reading Comprehension",
          type: "video",
          duration: "35:00",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 6,
          title: "Timed Reading Practice",
          type: "exercise",
          questions: 25,
          completed: false
        }
      ]
    }
  ],
  "3": [
    {
      id: 1,
      title: "Tuần 1: Advanced Test Strategies",
      description: "Chiến lược làm bài nâng cao cho điểm cao",
      lessons: [
        {
          id: 1,
          title: "Time Management Mastery",
          type: "video",
          duration: "30:20",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 2,
          title: "Advanced Part 4 Strategies",
          type: "video",
          duration: "35:15",
          completed: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          id: 3,
          title: "Full Mock Test 1",
          type: "exercise",
          questions: 200,
          completed: false
        }
      ]
    }
  ]
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const courseId = id as string
  const course = courseData[courseId as keyof typeof courseData]
  const curriculum = curriculumData[courseId as keyof typeof curriculumData] || []
  
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [studyDays, setStudyDays] = useState(0)

  useEffect(() => {
    // Calculate study days only on client side to avoid hydration mismatch
    const startDate = new Date('2024-01-01')
    const currentDate = new Date()
    const days = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    setStudyDays(days)
  }, [])

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Khóa học không tồn tại</h1>
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

  // Tính toán progress
  const totalLessons = curriculum.reduce((acc, week) => acc + week.lessons.length, 0)
  const completedLessons = curriculum.reduce((acc, week) => 
    acc + week.lessons.filter(lesson => lesson.completed).length, 0
  )
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const handleLessonComplete = () => {
    if (selectedLesson) {
      // Update lesson completion status
      const updatedLesson = { ...selectedLesson, completed: true }
      setSelectedLesson(updatedLesson)
      
      // In a real app, you would update this in your state management or API
      console.log(`Lesson ${selectedLesson.id} completed`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/courses">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">STAREDU</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Trang chủ
              </Link>
              <Link to="/courses" className="text-blue-600 font-medium">
                Khóa học
              </Link>
              <Link to="/practice" className="text-gray-700 hover:text-blue-600">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{course.description}</p>
            </div>
            <Badge className="bg-green-500 text-lg px-4 py-2">{course.target}</Badge>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              <span className="font-medium">{course.rating}</span>
              <span className="ml-1">({course.students} học viên)</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration}
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {course.lessons} bài học
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="learn" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="learn">Học bài</TabsTrigger>
            <TabsTrigger value="progress">Tiến độ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <CourseOverview />
          </TabsContent>

          <TabsContent value="learn" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {selectedLesson ? (
                  <div className="space-y-6">
                    {selectedLesson.type === 'video' && (
                      <VideoPlayer 
                        lesson={selectedLesson} 
                        onComplete={handleLessonComplete}
                      />
                    )}
                    {selectedLesson.type === 'exercise' && (
                      <ExercisePlayer 
                        lesson={selectedLesson} 
                        onComplete={handleLessonComplete}
                      />
                    )}
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {selectedLesson.title}
                          <Badge variant={selectedLesson.completed ? "default" : "secondary"}>
                            {selectedLesson.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-gray-600">
                            {selectedLesson.type === 'video' 
                              ? "Xem video bài giảng và ghi chú những điểm quan trọng."
                              : "Hoàn thành tất cả câu hỏi để đạt điểm tối đa."
                            }
                          </p>
                          {!selectedLesson.completed && (
                            <Button 
                              className="w-full" 
                              onClick={handleLessonComplete}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Đánh dấu hoàn thành
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Chào mừng đến với khóa học</CardTitle>
                      <CardDescription>
                        Chọn một bài học bên trái để bắt đầu học
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Hãy chọn một video hoặc bài tập từ danh sách bên trái để bắt đầu
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge className="bg-green-500">{course.target}</Badge>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tiến độ</span>
                        <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="w-full" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {course.duration}
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                          {course.lessons} bài
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          {course.students}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-400" />
                          {course.rating}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center space-x-3">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{course.instructor.name}</p>
                          <p className="text-xs text-gray-500">{course.instructor.title}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Curriculum */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lộ trình học</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {curriculum.map((week, weekIndex) => (
                        <div key={week.id} className="space-y-2">
                          <button
                            onClick={() => setCurrentWeek(currentWeek === weekIndex ? -1 : weekIndex)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="text-left">
                              <h4 className="font-medium text-sm">{week.title}</h4>
                              <p className="text-xs text-gray-500">{week.description}</p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {week.lessons.filter(l => l.completed).length}/{week.lessons.length}
                            </div>
                          </button>
                          
                          {currentWeek === weekIndex && (
                            <div className="pl-4 space-y-2">
                              {week.lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
                                    selectedLesson?.id === lesson.id 
                                      ? 'bg-blue-50 border border-blue-200' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex-shrink-0">
                                    {lesson.completed ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : lesson.type === 'video' ? (
                                      <Video className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-orange-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{lesson.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {lesson.type === 'video' 
                                        ? lesson.duration 
                                        : `${lesson.questions} câu hỏi`
                                      }
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ học tập</CardTitle>
                <CardDescription>Theo dõi quá trình học của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {Math.round(progressPercentage)}%
                    </div>
                    <p className="text-gray-600">Hoàn thành khóa học</p>
                  </div>
                  
                  <Progress value={progressPercentage} className="w-full h-3" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{completedLessons}</div>
                      <p className="text-sm text-gray-600">Bài đã học</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{totalLessons - completedLessons}</div>
                      <p className="text-sm text-gray-600">Bài còn lại</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {curriculum.filter(week => week.lessons.some(l => l.completed)).length}
                      </div>
                      <p className="text-sm text-gray-600">Tuần đã học</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {studyDays}
                      </div>
                      <p className="text-sm text-gray-600">Ngày học</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Chi tiết tiến độ theo tuần</h4>
                    {curriculum.map((week, index) => {
                      const weekProgress = (week.lessons.filter(l => l.completed).length / week.lessons.length) * 100
                      return (
                        <div key={week.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{week.title}</h5>
                            <span className="text-sm text-gray-500">
                              {week.lessons.filter(l => l.completed).length}/{week.lessons.length} bài
                            </span>
                          </div>
                          <Progress value={weekProgress} className="w-full" />
                        </div>
                      )
                    })}
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
