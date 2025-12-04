import axiosInstance from './axiosConfig';

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  skill_groups: string[];
  assigned_teachers: any[];
  is_published: boolean;
  order: number;
  total_enrollments: number;
  average_rating: number;
  total_reviews: number;
  price: number;
  original_price: number;
  is_free: boolean;
  total_lessons?: number;
  total_duration_minutes?: number;
  completion_percentage?: number; // ✅ Thêm field này
  createdAt: string;
  updatedAt: string;
}

export interface GetCoursesResponse {
  success: boolean;
  data: {
    data: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  duration_minutes: number;
  total_sections: number;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface Section {
  _id: string;
  lesson_id: string;
  title: string;
  order: number;
  description: string;
  video_url: string | null;
  mindmap_url: string | null;
  test_id: string | null;
  type?: string; // video, audio, mindmap, quiz, exercise, article
  audioUrl?: string;
  articleContent?: string;
  questions?: Question[];
  passingScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  questionText?: string;
  questionType: 'multiple-choice' | 'fill-blank';
  options?: string[];
  correctAnswer?: number;
  correctAnswers?: string[];
  explanation?: string;
  points?: number;
  order?: number;
  audio?: string;
  image?: string;
  transcript?: string;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
}

export interface GetCourseDetailResponse {
  success: boolean;
  data: CourseDetail;
  message: string;
}

export const courseApi = {
  // GET /api/student/courses - Lấy danh sách khóa học (public)
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    skill_groups?: string;
    is_published?: boolean;
  }): Promise<GetCoursesResponse> => {
    const response = await axiosInstance.get('/student/courses', { params });
    return response.data;
  },

  // GET /api/student/courses/:id - Lấy chi tiết khóa học (public)
  getCourseById: async (id: string): Promise<GetCourseDetailResponse> => {
    const response = await axiosInstance.get(`/student/courses/${id}`);
    return response.data;
  },

  // GET /api/student/courses/enrolled - Lấy khóa học đã đăng ký (private)
  getEnrolledCourses: async (): Promise<any> => {
    const response = await axiosInstance.get('/student/courses/enrolled');
    return response.data;
  },

  // GET /api/student/courses/:id/lessons - Lấy lessons và sections (public với optional auth)
  getCourseLessons: async (courseId: string): Promise<{
    success: boolean;
    data: {
      course_id: string;
      course_title: string;
      is_enrolled: boolean;
      lessons: Lesson[];
    };
    message: string;
  }> => {
    const response = await axiosInstance.get(`/student/courses/${courseId}/lessons`);
    return response.data;
  },

  // GET courses by roadmap ID - via roadmap detail API
  getCoursesByRoadmap: async (roadmapId: string): Promise<{
    success: boolean;
    data: Course[];
    message: string;
  }> => {
    try {
      // Get roadmap detail which includes courses array
      console.log('🔍 Fetching roadmap detail:', roadmapId)
      const roadmapResponse = await axiosInstance.get(`/student/roadmaps/${roadmapId}`);
      console.log('📦 Roadmap response:', roadmapResponse.data)
      
      const roadmapData = roadmapResponse.data.data;
      const courses = roadmapData.courses || [];
      
      console.log('📚 Course IDs from roadmap:', courses)
      
      if (!Array.isArray(courses) || courses.length === 0) {
        console.warn('⚠️ No courses found in roadmap')
        return {
          success: true,
          data: [],
          message: 'No courses found'
        };
      }
      
      // Load full course details
      const courseDetailsPromises = courses.map((course: any) => {
        // Check if already populated object or just ID
        const courseId = typeof course === 'string' ? course : course._id;
        
        return axiosInstance.get(`/student/courses/${courseId}`)
          .then(res => {
            console.log(`✅ Loaded course ${courseId}:`, res.data.data.title)
            return res.data.data
          })
          .catch(err => {
            console.error(`❌ Failed to load course ${courseId}:`, err.message)
            return null
          })
      });
      
      const courseDetails = await Promise.all(courseDetailsPromises);
      const validCourses = courseDetails.filter(c => c !== null);
      
      console.log('✅ Final courses:', validCourses.length)
      
      return {
        success: true,
        data: validCourses,
        message: 'Success'
      };
    } catch (error: any) {
      console.error('❌ Error in getCoursesByRoadmap:', error)
      throw error;
    }
  },

  // =====================================================
  // Section Progress APIs
  // =====================================================

  // POST /api/student/sections/:sectionId/submit - Submit bài tập
  submitExercise: async (sectionId: string, answers: Array<{ question_id: string; selected_answer: number }>): Promise<{
    success: boolean;
    message: string;
    data: {
      section_id: string;
      total_questions: number;
      correct_answers: number;
      score_percentage: number;
      is_completed: boolean;
      passing_score: number;
      attempts: number;
      answers: Array<{ question_id: string; selected_answer: number; is_correct: boolean }>;
    };
  }> => {
    const response = await axiosInstance.post(`/student/sections/${sectionId}/submit`, { answers });
    return response.data;
  },

  // POST /api/student/sections/:sectionId/view - Đánh dấu đã xem video/mindmap
  markSectionViewed: async (sectionId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      section_id: string;
      is_viewed: boolean;
      is_completed: boolean;
    };
  }> => {
    const response = await axiosInstance.post(`/student/sections/${sectionId}/view`);
    return response.data;
  },

  // GET /api/student/sections/:sectionId/progress - Lấy tiến độ section
  getSectionProgress: async (sectionId: string): Promise<any> => {
    const response = await axiosInstance.get(`/student/sections/${sectionId}/progress`);
    return response.data;
  },

  // GET /api/student/courses/:courseId/progress - Lấy tiến độ course
  getCourseProgress: async (courseId: string): Promise<any> => {
    const response = await axiosInstance.get(`/student/courses/${courseId}/progress`);
    return response.data;
  },
};
