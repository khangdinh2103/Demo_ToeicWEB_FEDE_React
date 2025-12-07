import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Trophy } from "lucide-react"
import type { RecommendedRoadmap } from "@/api/roadmapRecommendationApi"

interface RoadmapTimelineProps {
  roadmaps: RecommendedRoadmap[]
}

interface Stage {
  number: number
  title: string
  courses: number
  duration: string
  color: string
}

export default function RoadmapTimeline({ roadmaps }: RoadmapTimelineProps) {
  if (!roadmaps || roadmaps.length === 0) return null

  // Chuyển đổi roadmaps thành các chặng (stages)
  const stages: Stage[] = roadmaps.map((rm, index) => {
    const courseCount = rm.courses?.length || 0
    const weeks = rm.estimatedWeeks || 0
    
    return {
      number: index + 1,
      title: rm.roadmap.title || `Chặng ${index + 1}`,
      courses: courseCount,
      duration: `${weeks} tuần`,
      color: getStageColor(index)
    }
  })

  function getStageColor(index: number): string {
    const colors = [
      'from-yellow-400 to-yellow-500',   // Chặng 1 - Vàng
      'from-blue-400 to-blue-500',       // Chặng 2 - Xanh dương
      'from-green-400 to-green-500',     // Chặng 3 - Xanh lá
      'from-purple-400 to-purple-500',   // Chặng 4 - Tím
    ]
    return colors[index % colors.length]
  }

  function getTextColor(index: number): string {
    const colors = [
      'text-yellow-600',
      'text-blue-600', 
      'text-green-600',
      'text-purple-600',
    ]
    return colors[index % colors.length]
  }

  function getBgColor(index: number): string {
    const colors = [
      'bg-yellow-50',
      'bg-blue-50',
      'bg-green-50', 
      'bg-purple-50',
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="w-full py-8">


      {/* Timeline */}
      <div className="relative max-w-6xl mx-auto">
        {/* Đường nối giữa các chặng */}
        <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 hidden md:block" 
             style={{ 
               top: '96px',
               left: 'calc(8.33% + 40px)',
               right: 'calc(8.33% + 40px)'
             }}
        />

        {/* Grid cho các chặng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {stages.map((stage, index) => (
            <div key={index} className="relative">
              {/* Số thứ tự chặng */}
              <div className="flex justify-center mb-4">
                <div className={`
                  w-20 h-20 rounded-full bg-gradient-to-br ${stage.color}
                  flex items-center justify-center shadow-lg
                  transform transition-transform hover:scale-110
                  relative z-10
                `}>
                  <span className="text-3xl font-bold text-white">{stage.number}</span>
                </div>
              </div>

              {/* Card thông tin chặng */}
              <Card className={`${getBgColor(index)} border-2 hover:shadow-xl transition-all duration-300`}>
                <CardContent className="pt-6">
                  {/* Tiêu đề chặng */}
                  <div className="text-center mb-4">
                    <h3 className={`text-xl font-bold mb-1 ${getTextColor(index)}`}>
                      {stage.title}
                    </h3>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="space-y-3">
                    {/* Số khóa học */}
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{stage.courses} khóa học</span>
                    </div>

                    {/* Thời gian */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{stage.duration}</span>
                    </div>

                    {/* Badge kỹ năng */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {roadmaps[index].roadmap.skills?.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className={`${getTextColor(index)} border-current`}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Mục tiêu điểm */}
                  <div className={`mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2`}>
                    <Trophy className={`w-5 h-5 ${getTextColor(index)}`} />
                    <span className={`font-bold ${getTextColor(index)}`}>
                      Mục tiêu: {roadmaps[index].roadmap.target_score}+ điểm
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Mũi tên nối giữa các card (mobile) */}
              {index < stages.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-gray-400"></div>
                  <svg className="w-6 h-6 text-gray-400 -ml-2.5 mt-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>


      </div>
    </div>
  )
}
