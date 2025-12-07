import axiosInstance from './axiosConfig'

export interface SectionProgress {
  section_id: string
  is_done: boolean
  stars: number
}

export interface LessonProgress {
  lesson_id: string
  total_sections: number
  user_capt: number
  is_completed: boolean
  section_progress: SectionProgress[]
  completion_percentage: number
}

export interface CourseProgress {
  course_id: string
  lessons: LessonProgress[]
  total_completion_percentage: number
}

export const progressApi = {
  // Lấy tiến độ của một section
  getSectionProgress: async (sectionId: string): Promise<SectionProgress> => {
    const response = await axiosInstance.get(`/student/sections/${sectionId}/progress`)
    return response.data.data
  },

  // Lấy tiến độ của course (tất cả lessons)
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await axiosInstance.get(`/student/courses/${courseId}/progress`)
    return response.data.data
  },

  // Submit bài tập
  submitExercise: async (sectionId: string, answers: Array<{question_id: string, selected_answer: number}>) => {
    const response = await axiosInstance.post(`/student/sections/${sectionId}/submit`, { answers })
    return response.data.data
  },

  // Đánh dấu đã xem
  markAsViewed: async (sectionId: string) => {
    const response = await axiosInstance.post(`/student/sections/${sectionId}/view`)
    return response.data.data
  }
}
