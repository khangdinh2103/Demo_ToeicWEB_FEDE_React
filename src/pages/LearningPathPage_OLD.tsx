"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Clock, Award } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { roadmapApi, type Roadmap } from "@/api/roadmapApi"

export default function LearningPathPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const placementTestData = location.state as { 
    placementTestScore?: number, 
    correctAnswers?: number, 
    totalQuestions?: number 
  } | null
  
  const [selectedSkill, setSelectedSkill] = useState("all")
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<Roadmap[]>([])

  // Load roadmaps from API
  useEffect(() => {
    const loadRoadmaps = async () => {
      try {
        setLoading(true)
        const response = await roadmapApi.getPublicRoadmaps(1, 100)
        setRoadmaps(response.data)
      } catch (error) {
        console.error("Error loading roadmaps:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRoadmaps()
  }, [])

  // Filter roadmaps by skill
  useEffect(() => {
    if (roadmaps.length === 0) return

    let filtered = roadmaps

    if (selectedSkill === "listening-reading") {
      filtered = roadmaps.filter(r => 
        r.skill_groups.includes("listening") || r.skill_groups.includes("reading")
      )
    } else if (selectedSkill === "speaking-writing") {
      filtered = roadmaps.filter(r => 
        r.skill_groups.includes("speaking") || r.skill_groups.includes("writing")
      )
    }

    // Sort by target_score
    filtered = filtered.sort((a, b) => a.target_score - b.target_score)
    
    setFilteredRoadmaps(filtered)
  }, [roadmaps, selectedSkill])

  const getSkillIcon = (skillGroups: string[]) => {
    if (skillGroups.includes("listening") || skillGroups.includes("reading")) {
      return "🎧"
    } else if (skillGroups.includes("speaking") || skillGroups.includes("writing")) {
      return "🗣️"
    }
    return "📚"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải lộ trình...</p>
        </div>
      </div>
    )
  }

  const currentLevels = {
    "listening-reading": [
      { id: "lr_1_449", label: "TOEIC LR: 1-449", description: "Trình độ cơ bản" },
      { id: "lr_450_549", label: "TOEIC LR: 450-549", description: "Trình độ trung cấp" },
      { id: "lr_550_650", label: "TOEIC LR: 550-650", description: "Trình độ cao" }
    ],
    "speaking-writing": [
      { id: "sw_1_99", label: "TOEIC SW: 1-99", description: "Trình độ cơ bản" },
      { id: "sw_100_199", label: "TOEIC SW: 100-199", description: "Trình độ trung cấp" },
      { id: "sw_200_250", label: "TOEIC SW: 200-250", description: "Trình độ cao" }
    ],
    "all": [
      { id: "lr_1_449_sw_1_99", label: "LR 1-449 & SW 1-99", description: "Căn bản" },
      { id: "lr_450_549_sw_100_199", label: "LR 450-549 & SW 100-199", description: "Trung cấp" },
      { id: "lr_550_650_sw_200_250", label: "LR 550-650 & SW 200-250", description: "Chuyên sâu" }
    ]
  }

  const targetLevels = {
    "listening-reading": [
      { id: "lr_450", label: "TOEIC LR: 450+", description: "Mục tiêu cơ bản" },
      { id: "lr_550", label: "TOEIC LR: 550+", description: "Mục tiêu trung cấp" },
      { id: "lr_800", label: "TOEIC LR: 800+", description: "Mục tiêu cao" }
    ],
    "speaking-writing": [
      { id: "sw_100", label: "TOEIC SW: 100+", description: "Mục tiêu cơ bản" },
      { id: "sw_200", label: "TOEIC SW: 200+", description: "Mục tiêu trung cấp" },
      { id: "sw_300", label: "TOEIC SW: 300+", description: "Mục tiêu cao" }
    ],
    "all": [
      { id: "lr_450_sw_100", label: "LR 450+ & SW 100+", description: "Mục tiêu căn bản" },
      { id: "lr_550_sw_200", label: "LR 550+ & SW 200+", description: "Mục tiêu trung cấp" },
      { id: "lr_800_sw_300", label: "LR 800+ & SW 300+", description: "Mục tiêu chuyên sâu" }
    ]
  }

  // Course definitions for each skill level
  const courses = {
    lr: {
      "lr_450": { title: "LR căn bản 450+", subtitle: "TOEIC Listening & Reading cơ bản", icon: "🎧" },
      "lr_550": { title: "LR trung cấp 550+", subtitle: "TOEIC Listening & Reading trung cấp", icon: "�" },
      "lr_800": { title: "LR chuyên sâu 800+", subtitle: "TOEIC Listening & Reading chuyên sâu", icon: "🎧" }
    },
    sw: {
      "sw_100": { title: "SW căn bản 100+", subtitle: "TOEIC Speaking & Writing cơ bản", icon: "�️" },
      "sw_200": { title: "SW trung cấp 200+", subtitle: "TOEIC Speaking & Writing trung cấp", icon: "�️" },
      "sw_300": { title: "SW chuyên sâu 300+", subtitle: "TOEIC Speaking & Writing chuyên sâu", icon: "�️" }
    },
    combined: {
      "lr_450_sw_100": { title: "4 kỹ năng căn bản", subtitle: "LR 450+ & SW 100+", icon: "📚" },
      "lr_550_sw_200": { title: "4 kỹ năng trung cấp", subtitle: "LR 550+ & SW 200+", icon: "📚" },
      "lr_800_sw_300": { title: "4 kỹ năng chuyên sâu", subtitle: "LR 800+ & SW 300+", icon: "📚" }
    }
  }

  // Helper functions to determine learning path
  const getCurrentLevelIndex = (currentId: string, skill: string) => {
    if (skill === "listening-reading") {
      if (currentId === "lr_1_449") return 0
      if (currentId === "lr_450_549") return 1
      if (currentId === "lr_550_650") return 2
    } else if (skill === "speaking-writing") {
      if (currentId === "sw_1_99") return 0
      if (currentId === "sw_100_199") return 1
      if (currentId === "sw_200_250") return 2
    } else if (skill === "all") {
      if (currentId === "lr_1_449_sw_1_99") return 0
      if (currentId === "lr_450_549_sw_100_199") return 1
      if (currentId === "lr_550_650_sw_200_250") return 2
    }
    return 0
  }

  const getTargetLevelIndex = (targetId: string, skill: string) => {
    if (skill === "listening-reading") {
      if (targetId === "lr_450") return 0
      if (targetId === "lr_550") return 1
      if (targetId === "lr_800") return 2
    } else if (skill === "speaking-writing") {
      if (targetId === "sw_100") return 0
      if (targetId === "sw_200") return 1
      if (targetId === "sw_300") return 2
    } else if (skill === "all") {
      if (targetId === "lr_450_sw_100") return 0
      if (targetId === "lr_550_sw_200") return 1
      if (targetId === "lr_800_sw_300") return 2
    }
    return 0
  }

  const generateLearningPath = (currentId: string, targetId: string, skill: string): LearningPath => {
    const currentIndex = getCurrentLevelIndex(currentId, skill)
    const targetIndex = getTargetLevelIndex(targetId, skill)
    
    // If target is lower than current, show already achieved message
    if (targetIndex < currentIndex) {
      return {
        title: "Bạn đã đạt mức độ này hoặc cao hơn",
        duration: "Không áp dụng",
        courses: [{
          id: 1,
          title: "Duy trì trình độ",
          subtitle: "Bạn đã ở mức độ mục tiêu hoặc cao hơn",
          icon: "✅",
          status: "completed"
        }],
        milestones: [{ name: "Trình độ hiện tại", score: "Đã đạt mục tiêu", icon: "🏆" }]
      }
    }

    // Logic mới: Tính số chặng dựa trên độ chênh lệch
    // - Cùng cấp (currentIndex == targetIndex): 1 chặng
    // - Chênh 1 cấp: 2 chặng
    // - Chênh 2 cấp (cơ bản -> 800+): 3 chặng
    const levelDiff = targetIndex - currentIndex
    const numberOfStages = levelDiff + 1 // 0 -> 1 chặng, 1 -> 2 chặng, 2 -> 3 chặng

    const coursesToTake: Course[] = []
    let pathTitle = ""
    let targetScore = ""

    if (skill === "listening-reading") {
      const lrCourses = ["lr_450", "lr_550", "lr_800"]
      // Lấy các khóa học từ currentIndex đến targetIndex
      for (let i = currentIndex; i <= targetIndex; i++) {
        const courseKey = lrCourses[i]
        const stageNumber = i - currentIndex + 1
        coursesToTake.push({
          id: stageNumber,
          title: `Chặng ${stageNumber}`,
          subtitle: courses.lr[courseKey as keyof typeof courses.lr].title,
          icon: courses.lr[courseKey as keyof typeof courses.lr].icon,
          status: "available"
        })
      }
      pathTitle = `Lộ trình TOEIC Listening & Reading`
      targetScore = `TOEIC LR: ${lrCourses[targetIndex].replace('lr_', '')}+`
    } else if (skill === "speaking-writing") {
      const swCourses = ["sw_100", "sw_200", "sw_300"]
      for (let i = currentIndex; i <= targetIndex; i++) {
        const courseKey = swCourses[i]
        const stageNumber = i - currentIndex + 1
        coursesToTake.push({
          id: stageNumber,
          title: `Chặng ${stageNumber}`,
          subtitle: courses.sw[courseKey as keyof typeof courses.sw].title,
          icon: courses.sw[courseKey as keyof typeof courses.sw].icon,
          status: "available"
        })
      }
      pathTitle = `Lộ trình TOEIC Speaking & Writing`
      targetScore = `TOEIC SW: ${swCourses[targetIndex].replace('sw_', '')}+`
    } else {
      const combinedCourses = ["lr_450_sw_100", "lr_550_sw_200", "lr_800_sw_300"]
      for (let i = currentIndex; i <= targetIndex; i++) {
        const courseKey = combinedCourses[i]
        const stageNumber = i - currentIndex + 1
        coursesToTake.push({
          id: stageNumber,
          title: `Chặng ${stageNumber}`,
          subtitle: courses.combined[courseKey as keyof typeof courses.combined].title,
          icon: courses.combined[courseKey as keyof typeof courses.combined].icon,
          status: "available"
        })
      }
      pathTitle = `Lộ trình TOEIC 4 kỹ năng`
      targetScore = courses.combined[combinedCourses[targetIndex] as keyof typeof courses.combined].subtitle
    }

    return {
      title: pathTitle,
      duration: `${numberOfStages * 2}-${numberOfStages * 3} tháng`,
      courses: coursesToTake,
      milestones: [{ name: "Mục tiêu đạt được", score: targetScore, icon: "🎯" }]
    }
  }

  const getCurrentPath = () => {
    if (!currentLevel || !targetLevel) {
      return generateLearningPath("lr_1_449_sw_1_99", "lr_450_sw_100", "all")
    }
    
    return generateLearningPath(currentLevel, targetLevel, selectedSkill)
  }

  const currentPath = getCurrentPath()

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Placement Test Result Banner */}
        {placementTestData && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-1">
                    Kết quả Test Đầu Vào: {placementTestData.placementTestScore} điểm
                  </h3>
                  <p className="text-green-700 mb-2">
                    Bạn đã trả lời đúng {placementTestData.correctAnswers}/{placementTestData.totalQuestions} câu 
                    ({((placementTestData.correctAnswers! / placementTestData.totalQuestions!) * 100).toFixed(1)}%)
                  </p>
                  <Badge className="bg-green-600 text-white">
                    Lộ trình học đã được tùy chỉnh dựa trên kết quả của bạn
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            {/* Timeline / stages visual */}
            <div className="w-full max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{currentPath.title}</h3>
              <p className="text-sm text-gray-600 mb-4">Thời gian dự kiến: {currentPath.duration}</p>

              <div className={`flex items-center ${currentPath.courses.length === 1 ? 'justify-center' : ''}`}>
                {currentPath.courses.map((course: Course, idx: number) => (
                  <div key={course.id} className={`${currentPath.courses.length === 1 ? 'flex justify-center' : 'flex-1 flex items-center'}`}>
                    <div className={`${currentPath.courses.length === 1 ? 'flex items-center' : 'w-full flex items-center'}`}>
                      {/* left connector */}
                      {idx !== 0 && currentPath.courses.length > 1 && (
                        <div className="hidden md:block h-1 bg-blue-200 flex-1 -mr-6" aria-hidden />
                      )}

                      <div className="flex flex-col items-center text-center px-2 md:px-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${idx === 0 ? 'bg-yellow-500' : 'bg-blue-400'}`}>
                          <span className="text-lg font-bold">{idx + 1}</span>
                        </div>
                        <div className="mt-2 font-medium">Chặng {idx + 1}</div>
                        <div className="text-xs text-gray-600 max-w-[110px]">{course.subtitle}</div>
                      </div>

                      {/* right connector */}
                      {idx !== currentPath.courses.length - 1 && currentPath.courses.length > 1 && (
                        <div className="hidden md:block h-1 bg-blue-200 flex-1 -ml-6" aria-hidden />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Section */}
              <div className="space-y-6">
                {getCurrentPath().courses.map((course: Course) => (
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
                {getCurrentPath().milestones.map((milestone: Milestone, index: number) => (
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
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Navigate to detail page with path data
                  navigate("/learning-path/detail", {
                    state: {
                      ...currentPath,
                      currentLevel,
                      targetLevel,
                      skill: selectedSkill
                    }
                  })
                }}
              >
                Bắt đầu học ngay
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  navigate("/learning-path/detail", {
                    state: {
                      ...currentPath,
                      currentLevel,
                      targetLevel,
                      skill: selectedSkill
                    }
                  })
                }}
              >
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
