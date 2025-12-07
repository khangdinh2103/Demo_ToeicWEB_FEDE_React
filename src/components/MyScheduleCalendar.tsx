"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight, Settings, RefreshCw } from "lucide-react"
import { learningScheduleApi, type LearningSchedule, type ScheduledLesson } from "@/api/learningScheduleApi"
import { progressApi, type LessonProgress } from "@/api/progressApi"

interface MyScheduleCalendarProps {
  onOpenSettings?: () => void
}

interface EnrichedLesson extends ScheduledLesson {
  progress?: LessonProgress
  completionPercentage?: number
}

export default function MyScheduleCalendar({ onOpenSettings }: MyScheduleCalendarProps) {
  const [schedule, setSchedule] = useState<LearningSchedule | null>(null)
  const [enrichedLessons, setEnrichedLessons] = useState<Map<string, EnrichedLesson>>(new Map())
  const [loading, setLoading] = useState(true)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadSchedule()
    // Auto-check for reschedule daily
    checkAndReschedule()
  }, [])
  
  const checkAndReschedule = async () => {
    const lastCheck = localStorage.getItem('last_reschedule_check')
    const today = new Date().toDateString()
    
    if (lastCheck !== today) {
      try {
        await learningScheduleApi.reschedule()
        localStorage.setItem('last_reschedule_check', today)
        await loadSchedule()
      } catch (error) {
        console.log('No need to reschedule or error:', error)
      }
    }
  }
  
  const handleManualReschedule = async () => {
    if (!confirm('Bạn có chắc muốn cập nhật lại lịch học? Các lesson chưa hoàn thành sẽ được đẩy sang ngày tiếp theo.')) {
      return
    }
    
    try {
      setIsRescheduling(true)
      await learningScheduleApi.reschedule()
      await loadSchedule()
      alert('Đã cập nhật lịch học thành công!')
    } catch (error: any) {
      console.error('Error rescheduling:', error)
      alert(`Lỗi khi cập nhật lịch: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsRescheduling(false)
    }
  }

  const loadSchedule = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading schedule...')
      const data = await learningScheduleApi.getMySchedule()
      console.log('✅ Schedule loaded:', data)
      setSchedule(data)
      
      // Sync with lesson progress
      await syncWithProgress(data)
    } catch (error: any) {
      console.error('❌ Error loading schedule:', error)
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      })
      if (error.response?.status !== 404) {
        console.error('Unexpected error:', error)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const syncWithProgress = async (scheduleData: LearningSchedule) => {
    try {
      setIsSyncing(true)
      console.log('🔄 Syncing with lesson progress...')
      
      // Get unique course IDs
      const courseIds = new Set<string>()
      scheduleData.scheduled_lessons.forEach(lesson => {
        const courseId = typeof lesson.course_id === 'string' 
          ? lesson.course_id 
          : lesson.course_id._id
        courseIds.add(courseId)
      })
      
      // Fetch progress for all courses
      const progressMap = new Map<string, LessonProgress>()
      for (const courseId of courseIds) {
        try {
          const courseProgress = await progressApi.getCourseProgress(courseId)
          courseProgress.lessons.forEach(lessonProg => {
            progressMap.set(lessonProg.lesson_id, lessonProg)
          })
        } catch (error) {
          console.log(`No progress for course ${courseId}`)
        }
      }
      
      // Enrich lessons with progress
      const enriched = new Map<string, EnrichedLesson>()
      scheduleData.scheduled_lessons.forEach(lesson => {
        const lessonId = typeof lesson.lesson_id === 'string' 
          ? lesson.lesson_id 
          : lesson.lesson_id._id
        const progress = progressMap.get(lessonId)
        
        enriched.set(lessonId, {
          ...lesson,
          progress,
          completionPercentage: progress?.completion_percentage || 0
        })
      })
      
      setEnrichedLessons(enriched)
      console.log('✅ Synced with progress:', enriched.size, 'lessons')
    } catch (error) {
      console.error('Error syncing progress:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getMonthName = (date: Date) => {
    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
  }

  const generateCalendarWeeks = () => {
    if (!schedule) return []

    const today = new Date()
    const viewDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1)
    
    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const calendarStart = new Date(monthStart)
    calendarStart.setDate(monthStart.getDate() - monthStart.getDay())

    const weeks = []
    let currentWeekStart = new Date(calendarStart)

    for (let weekNum = 0; weekNum < 5; weekNum++) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentWeekStart)
        dayDate.setDate(currentWeekStart.getDate() + i)
        
        const dateKey = dayDate.toISOString().split('T')[0]
        const lessonsOnDate = schedule.scheduled_lessons
          .filter(l => new Date(l.scheduled_date).toISOString().split('T')[0] === dateKey)
          .map(lesson => {
            const lessonId = typeof lesson.lesson_id === 'string' 
              ? lesson.lesson_id 
              : lesson.lesson_id._id
            return enrichedLessons.get(lessonId) || lesson
          })

        week.push({
          date: dayDate,
          isCurrentMonth: dayDate.getMonth() === viewDate.getMonth(),
          isToday: dayDate.toDateString() === today.toDateString(),
          lessons: lessonsOnDate
        })
      }
      weeks.push(week)
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }

    return weeks
  }

  const handleCompleteLesson = async (lesson: ScheduledLesson) => {
    if (lesson.completed) return

    try {
      const lessonId = typeof lesson.lesson_id === 'string' ? lesson.lesson_id : lesson.lesson_id._id
      const sectionId = lesson.section_id
      
      await learningScheduleApi.completeLesson({
        lesson_id: lessonId,
        section_id: sectionId
      })
      await loadSchedule()
    } catch (error) {
      console.error('Error completing lesson:', error)
      alert('Lỗi khi đánh dấu hoàn thành')
    }
  }
  
  const getLessonTitle = (lesson: ScheduledLesson): string => {
    if (typeof lesson.lesson_id === 'object' && lesson.lesson_id.title) {
      return lesson.lesson_id.title
    }
    return `Lesson ${lesson.order_in_day}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Đang tải lịch học...</p>
        </CardContent>
      </Card>
    )
  }

  if (!schedule) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">Chưa có lịch học</h3>
          <p className="text-gray-600 mb-4">
            Bạn chưa có lịch học nào. Đăng ký lộ trình để tạo lịch học tự động.
          </p>
          <Button onClick={() => window.location.href = '/learning-path'}>
            Khám phá lộ trình
          </Button>
        </CardContent>
      </Card>
    )
  }

  const weeks = generateCalendarWeeks()
  const viewDate = new Date()
  viewDate.setMonth(viewDate.getMonth() + currentMonthOffset)

  // Calculate stats
  const totalLessons = schedule.scheduled_lessons.length
  const completedLessons = schedule.scheduled_lessons.filter(l => l.completed).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <Card className="border-2 border-indigo-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Lịch học của tôi
            </CardTitle>
            <p className="text-sm text-indigo-100 mt-1">
              {completedLessons}/{totalLessons} lessons hoàn thành ({progressPercent}%)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => schedule && syncWithProgress(schedule)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ tiến độ'}
            </Button>
            <Button
              onClick={handleManualReschedule}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              disabled={isRescheduling}
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              {isRescheduling ? 'Đang cập nhật...' : 'Cập nhật lịch'}
            </Button>
            <Button
              onClick={onOpenSettings}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4 mr-1" />
              Cài đặt
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-4 bg-white/10 rounded-lg px-4 py-2">
          <Button
            onClick={() => setCurrentMonthOffset(prev => prev - 1)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold">{getMonthName(viewDate)}</span>
          <Button
            onClick={() => setCurrentMonthOffset(0)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 text-xs px-3 h-8"
          >
            Hôm nay
          </Button>
          <Button
            onClick={() => setCurrentMonthOffset(prev => prev + 1)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => (
            <div
              key={day}
              className={`text-center font-bold py-2 rounded-lg text-sm ${
                idx === 0 || idx === 6
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-2">
              {week.map((dayCell, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`min-h-[120px] p-2 rounded-lg border-2 transition-all ${
                    !dayCell.isCurrentMonth
                      ? 'bg-gray-50 border-gray-200 opacity-40'
                      : dayCell.isToday
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'bg-white border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        dayCell.isToday
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {dayCell.date.getDate()}
                    </div>
                    {dayCell.isToday && (
                      <Badge variant="default" className="text-[8px] px-1 py-0 h-4">
                        Hôm nay
                      </Badge>
                    )}
                  </div>

                  {/* Lessons */}
                  <div className="space-y-1">
                    {dayCell.lessons.map((lesson: EnrichedLesson, idx) => {
                      const isCompleted = lesson.progress?.is_completed || lesson.completed
                      const progress = lesson.completionPercentage || 0
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => !isCompleted && handleCompleteLesson(lesson)}
                          className={`p-1.5 rounded text-[10px] cursor-pointer transition-all ${
                            isCompleted
                              ? 'bg-gray-300 text-gray-600 opacity-60'
                              : progress > 0
                                ? 'bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-yellow-100'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:shadow-sm'
                          }`}
                          title={
                            isCompleted 
                              ? 'Đã hoàn thành' 
                              : progress > 0
                                ? `Đang học: ${progress}%`
                                : 'Chưa bắt đầu'
                          }
                        >
                          <div className="flex items-center gap-1">
                            {isCompleted ? (
                              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            ) : progress > 0 ? (
                              <RefreshCw className="h-3 w-3 flex-shrink-0 text-yellow-600" />
                            ) : (
                              <Clock className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className={`truncate font-semibold ${isCompleted ? 'line-through' : ''}`}>
                              {getLessonTitle(lesson)}
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          {progress > 0 && !isCompleted && (
                            <div className="mt-1 ml-4">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-yellow-500 h-1 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="text-[8px] text-yellow-700 mt-0.5">
                                {progress}% ({lesson.progress?.user_capt}/{lesson.progress?.total_sections} sections)
                              </div>
                            </div>
                          )}
                          
                          <div className="text-[9px] opacity-70 ml-4 mt-0.5">
                            {lesson.estimated_duration}m
                            {isCompleted && lesson.actual_duration && (
                              <span className="ml-1">• {lesson.actual_duration}m thực tế</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Schedule info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {schedule.schedule_config.days_per_week}
              </div>
              <div className="text-xs text-gray-600">Ngày/tuần</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {schedule.schedule_config.min_hours_per_day}-{schedule.schedule_config.max_hours_per_day}h
              </div>
              <div className="text-xs text-gray-600">Giờ/ngày</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">
                {totalLessons}
              </div>
              <div className="text-xs text-gray-600">Tổng lessons</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
