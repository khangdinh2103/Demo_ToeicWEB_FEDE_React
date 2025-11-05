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
};
