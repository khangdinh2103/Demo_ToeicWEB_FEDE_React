import axiosInstance from './axiosConfig';

// ==================== INTERFACES ====================

export interface Enrollment {
  _id: string;
  roadmap: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    target_level: string;
    price: number;
    discount_percentage: number;
    total_courses: number;
    estimated_duration_weeks?: number;
  };
  enrolled_price: number;
  enrollment_date: string;
  completion_percentage: number;
  last_accessed?: string;
}

export interface GetEnrollmentListResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    data: Enrollment[];
  };
  message: string;
}

export interface GetEnrollmentByIdResponse {
  success: boolean;
  data: Enrollment;
  message: string;
}

// ==================== API METHODS ====================

export const enrollmentApi = {
  /**
   * GET /api/student/enrollments
   * Lấy danh sách roadmaps đã đăng ký của student
   */
  getEnrollmentList: async (page: number = 1, limit: number = 20): Promise<GetEnrollmentListResponse> => {
    const response = await axiosInstance.get('/student/enrollments', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * GET /api/student/enrollments/:id
   * Lấy chi tiết một enrollment theo ID
   */
  getEnrollmentById: async (enrollmentId: string): Promise<GetEnrollmentByIdResponse> => {
    const response = await axiosInstance.get(`/student/enrollments/${enrollmentId}`);
    return response.data;
  },

  /**
   * GET /api/student/enrollments/:id/courses
   * Lấy danh sách courses với completion percentage
   */
  getEnrollmentCourses: async (enrollmentId: string): Promise<{
    success: boolean;
    data: {
      data: Array<{
        _id: string;
        title: string;
        description?: string;
        thumbnail?: string;
        skill_groups: string[];
        target_level?: string;
        is_published: boolean;
        total_lessons: number;
        total_duration_minutes: number;
        average_rating: number;
        total_enrollments: number;
        assigned_teachers: Array<{
          _id: string;
          name: string;
          avatar?: string;
          experience_years: number;
        }>;
        completion_percentage: number;
      }>;
    };
    message: string;
  }> => {
    const response = await axiosInstance.get(`/student/enrollments/${enrollmentId}/courses`);
    return response.data;
  }
};
