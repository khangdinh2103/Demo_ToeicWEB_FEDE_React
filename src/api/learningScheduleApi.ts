import axiosInstance from './axiosConfig'

export interface ScheduledLesson {
  course_id: string | {
    _id: string
    title: string
  }
  lesson_id: string | {
    _id: string
    title: string
    duration: number
  }
  section_id: string
  scheduled_date: string
  estimated_duration: number
  completed: boolean
  completed_at?: string
  actual_duration?: number
  order_in_day: number
}

export interface ScheduleConfig {
  days_per_week: number
  min_hours_per_day: number
  max_hours_per_day: number
  start_date: string
  focus_skills: string[]
}

export interface LearningSchedule {
  _id: string
  user_id: string
  roadmap_ids: string[]
  schedule_config: ScheduleConfig
  scheduled_lessons: ScheduledLesson[]
  auto_reschedule: boolean
  last_rescheduled_at?: string
  created_at: string
  updated_at: string
}

export interface CreateScheduleRequest {
  roadmap_ids: string[]
  schedule_config: {
    days_per_week: number
    min_hours_per_day: number
    max_hours_per_day: number
    start_date: Date | string
    focus_skills: string[]
  }
}

export interface UpdateConfigRequest {
  days_per_week?: number
  min_hours_per_day?: number
  max_hours_per_day?: number
}

export interface CompleteLessonRequest {
  lesson_id: string
  section_id: string
  actual_duration?: number
}

export const learningScheduleApi = {
  // Tạo schedule mới (sau payment)
  createSchedule: async (data: CreateScheduleRequest): Promise<LearningSchedule> => {
    const response = await axiosInstance.post('/schedules', data)
    return response.data.data
  },

  // Lấy schedule của user hiện tại
  getMySchedule: async (): Promise<LearningSchedule> => {
    const response = await axiosInstance.get('/schedules/my-schedule')
    return response.data.data
  },

  // Đánh dấu lesson hoàn thành
  completeLesson: async (data: CompleteLessonRequest): Promise<LearningSchedule> => {
    const response = await axiosInstance.patch('/schedules/complete-lesson', data)
    return response.data.data
  },

  // Update schedule config
  updateConfig: async (config: UpdateConfigRequest): Promise<LearningSchedule> => {
    const response = await axiosInstance.put('/schedules/config', config)
    return response.data.data
  },

  // Trigger manual reschedule
  reschedule: async (): Promise<LearningSchedule> => {
    const response = await axiosInstance.post('/schedules/reschedule')
    return response.data.data
  },

  // Xóa schedule
  deleteSchedule: async (): Promise<void> => {
    await axiosInstance.delete('/schedules')
  }
}
