"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Target, TrendingUp, CheckCircle, Clock, Users, Star } from "lucide-react"
import { Link } from "react-router-dom"

export default function LearningPathPage() {
  const [selectedSkill, setSelectedSkill] = useState("all") // listening-reading, speaking-writing, all
  const [currentLevel, setCurrentLevel] = useState("lr1-295_sw1-99")
  const [targetLevel, setTargetLevel] = useState("lr600_sw200")

  // Update levels when skill changes
  useEffect(() => {
    if (selectedSkill === "listening-reading") {
      setCurrentLevel("lr450+")
      setTargetLevel("lr550")
    } else if (selectedSkill === "speaking-writing") {
      setCurrentLevel("sw100+")
      setTargetLevel("sw130")
    } else {
      setCurrentLevel("lr1-295_sw1-99")
      setTargetLevel("lr600_sw200")
    }
  }, [selectedSkill])

  const skillOptions = [
    { id: "listening-reading", label: "TOEIC Listening & Reading" },
    { id: "speaking-writing", label: "TOEIC Speaking & Writing" },
    { id: "all", label: "TOEIC 4 kỹ năng" }
  ]

  const currentLevels = {
    "listening-reading": [
      { id: "lr450+", label: "TOEIC LR: 450+", description: "Trình độ cơ bản" },
      { id: "lr550+", label: "TOEIC LR: 550+", description: "Trình độ trung cấp" },
      { id: "lr800+", label: "TOEIC LR: 800+", description: "Trình độ cao" }
    ],
    "speaking-writing": [
      { id: "sw100+", label: "TOEIC SW: 100+", description: "Trình độ cơ bản" },
      { id: "sw150+", label: "TOEIC SW: 150+", description: "Trình độ trung cấp" },
      { id: "sw250+", label: "TOEIC SW: 250+", description: "Trình độ cao" }
    ],
    "all": [
      { id: "lr1-295_sw1-99", label: "TOEIC LR 1–295 & SW 1–99", description: "Người mới bắt đầu" },
      { id: "lr300-595_sw100-199", label: "TOEIC LR 300–595 & SW 100–199", description: "Trình độ cơ bản" },
      { id: "lr600-650_sw200-250", label: "TOEIC LR 600–650 & SW 200–250", description: "Trình độ trung cấp" }
    ]
  }

  const targetLevels = {
    "listening-reading": [
      { id: "lr550", label: "TOEIC LR: 550", description: "Mục tiêu cơ bản" },
      { id: "lr700", label: "TOEIC LR: 700", description: "Mục tiêu trung cấp" },
      { id: "lr850+", label: "TOEIC LR: 850+", description: "Mục tiêu cao" }
    ],
    "speaking-writing": [
      { id: "sw130", label: "TOEIC SW: 130", description: "Mục tiêu cơ bản" },
      { id: "sw200", label: "TOEIC SW: 200", description: "Mục tiêu trung cấp" },
      { id: "sw300+", label: "TOEIC SW: 300+", description: "Mục tiêu cao" }
    ],
    "all": [
      { id: "lr300_sw100", label: "TOEIC LR 300 & SW 100", description: "Mục tiêu cơ bản" },
      { id: "lr600_sw200", label: "TOEIC LR 600 & SW 200", description: "Mục tiêu trung cấp" },
      { id: "lr800_sw300", label: "TOEIC LR 800+ & SW 300+", description: "Mục tiêu cao" }
    ]
  }

  const learningPaths = {
    // TOEIC 4 kỹ năng paths
    "lr1-295_sw1-99_lr300_sw100": {
      title: "Chặng 1: TOEIC 4 kỹ năng Nền tảng",
      duration: "3-4 tháng",
      courses: [
        {
          id: 1,
          title: "1 chặng",
          subtitle: "Gồm 5 khóa học nhỏ (LR + SW)",
          icon: "📚",
          status: "available"
        }
      ],
      milestones: [
        { name: "Cam kết mục tiêu đầu ra", score: "TOEIC LR 300 & SW 100", icon: "🎯" }
      ]
    },
    "lr1-295_sw1-99_lr600_sw200": {
      title: "Chặng 1: TOEIC 4 kỹ năng Nền tảng", 
      duration: "5-6 tháng",
      courses: [
        {
          id: 1,
          title: "1 chặng",
          subtitle: "Gồm 8 khóa học nhỏ (LR + SW)",
          icon: "📚",
          status: "available"
        }
      ],
      milestones: [
        { name: "Cam kết mục tiêu đầu ra", score: "TOEIC LR 600 & SW 200", icon: "🎯" }
      ]
    },
    "lr1-295_sw1-99_lr800_sw300": {
      title: "Chặng 1: TOEIC 4 kỹ năng Nền tảng",
      duration: "8-10 tháng", 
      courses: [
        {
          id: 1,
          title: "1 chặng",
          subtitle: "Gồm 12 khóa học nhỏ (LR + SW)",
          icon: "📚",
          status: "available"
        }
      ],
      milestones: [
        { name: "Cam kết mục tiêu đầu ra", score: "TOEIC LR 800+ & SW 300+", icon: "🎯" }
      ]
    },
    // TOEIC Listening & Reading paths
    "lr450+_lr550": {
      title: "TOEIC Listening & Reading - Cơ bản đến Trung cấp",
      duration: "3-4 tháng",
      courses: [
        {
          id: 1,
          title: "Khóa Listening & Reading",
          subtitle: "3 khóa học chuyên sâu",
          icon: "🎧",
          status: "available"
        }
      ],
      milestones: [
        { name: "Mục tiêu đạt được", score: "TOEIC LR: 550", icon: "🎯" }
      ]
    },
    "lr450+_lr700": {
      title: "TOEIC Listening & Reading - Cơ bản đến Khá",
      duration: "4-5 tháng",
      courses: [
        {
          id: 1,
          title: "Khóa Listening & Reading",
          subtitle: "4 khóa học chuyên sâu",
          icon: "🎧",
          status: "available"
        }
      ],
      milestones: [
        { name: "Mục tiêu đạt được", score: "TOEIC LR: 700", icon: "🎯" }
      ]
    },
    "lr450+_lr850+": {
      title: "TOEIC Listening & Reading - Cơ bản đến Xuất sắc",
      duration: "6-8 tháng",
      courses: [
        {
          id: 1,
          title: "Khóa Listening & Reading",
          subtitle: "6 khóa học chuyên sâu",
          icon: "🎧",
          status: "available"
        }
      ],
      milestones: [
        { name: "Mục tiêu đạt được", score: "TOEIC LR: 850+", icon: "🎯" }
      ]
    },
    // TOEIC Speaking & Writing paths
    "sw100+_sw130": {
      title: "TOEIC Speaking & Writing - Cơ bản đến Trung cấp",
      duration: "3-4 tháng",
      courses: [
        {
          id: 1,
          title: "Khóa Speaking & Writing",
          subtitle: "3 khóa học chuyên sâu",
          icon: "🗣️",
          status: "available"
        }
      ],
      milestones: [
        { name: "Mục tiêu đạt được", score: "TOEIC SW: 130", icon: "🎯" }
      ]
    },
    "sw100+_sw200": {
      title: "TOEIC Speaking & Writing - Cơ bản đến Khá",
      duration: "4-5 tháng",
      courses: [
        {
          id: 1,
          title: "Khóa Speaking & Writing",
          subtitle: "4 khóa học chuyên sâu",
          icon: "🗣️",
          status: "available"
        }
      ],
      milestones: [
        { name: "Mục tiêu đạt được", score: "TOEIC SW: 200", icon: "🎯" }
      ]
    },
    "sw100+_sw300+": {
      title: "TOEIC Speaking & Writing - Cơ bản đến Xuất sắc",
      duration: "6-8 tháng",
      courses: [
        {
          id: 1,
          title: "Khóa Speaking & Writing",
          subtitle: "6 khóa học chuyên sâu",
          icon: "🗣️",
          status: "available"
        }
      ],
      milestones: [
        { name: "Mục tiêu đạt được", score: "TOEIC SW: 300+", icon: "🎯" }
      ]
    }
  }

  const getCurrentPath = () => {
    if (!currentLevel || !targetLevel) {
      return learningPaths["lr1-295_sw1-99_lr600_sw200"]
    }
    
    let pathKey = ""
    
    if (selectedSkill === "all") {
      pathKey = `${currentLevel}_${targetLevel}`
    } else if (selectedSkill === "listening-reading") {
      pathKey = `${currentLevel}_${targetLevel}`
    } else if (selectedSkill === "speaking-writing") {
      pathKey = `${currentLevel}_${targetLevel}`
    }
    
    return learningPaths[pathKey as keyof typeof learningPaths] || learningPaths["lr1-295_sw1-99_lr600_sw200"]
  }

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
        {/* Skill Selection Tabs */}
        <Tabs value={selectedSkill} onValueChange={setSelectedSkill} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-blue-100">
            <TabsTrigger 
              value="listening-reading" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              TOEIC Listening & Reading
            </TabsTrigger>
            <TabsTrigger 
              value="speaking-writing"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              TOEIC Speaking & Writing
            </TabsTrigger>
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              TOEIC 4 kỹ năng
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Level Selection */}
          <Card className="bg-blue-600 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Trình độ của tôi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentLevels[selectedSkill as keyof typeof currentLevels].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setCurrentLevel(level.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    currentLevel === level.id
                      ? "bg-white text-blue-600 border-white"
                      : "bg-transparent text-white border-white/30 hover:border-white/60"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm opacity-80">{level.description}</div>
                  </div>
                </button>
              ))}
              
              <div className="text-center pt-4">
                <p className="text-white/80 text-sm mb-2">
                  Bạn chưa rõ trình độ bản thân?
                </p>
                <Link to="/placement-test">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                    Kiểm tra đầu vào
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Target Level Selection */}
          <Card className="bg-blue-600 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Mục tiêu của tôi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetLevels[selectedSkill as keyof typeof targetLevels].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setTargetLevel(level.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    targetLevel === level.id
                      ? "bg-white text-blue-600 border-white"
                      : "bg-transparent text-white border-white/30 hover:border-white/60"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm opacity-80">{level.description}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Learning Path Recommendation */}
        <Card className="bg-white">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">📖</div>
            </div>
            <CardTitle className="text-2xl text-blue-600">{getCurrentPath().title}</CardTitle>
            <CardDescription className="text-lg">
              Thời gian dự kiến: {getCurrentPath().duration}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Section */}
              <div className="space-y-6">
                {getCurrentPath().courses.map((course) => (
                  <Card key={course.id} className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{course.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-900">{course.title}</h3>
                            <p className="text-sm text-blue-600">{course.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Milestone Section */}
              <div className="space-y-6">
                {getCurrentPath().milestones.map((milestone, index) => (
                  <Card key={index} className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{milestone.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-yellow-900">{milestone.name}</h3>
                          <p className="text-sm text-yellow-600">{milestone.score}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Bắt đầu học ngay
              </Button>
              <Button variant="outline" size="lg">
                Xem chi tiết lộ trình
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Học linh hoạt</h3>
              <p className="text-sm text-gray-600">Tự điều chỉnh tốc độ học theo thời gian của bạn</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Mục tiêu rõ ràng</h3>
              <p className="text-sm text-gray-600">Lộ trình được thiết kế để đạt mục tiêu cụ thể</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Theo dõi tiến độ</h3>
              <p className="text-sm text-gray-600">Giám sát quá trình học và cải thiện liên tục</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
