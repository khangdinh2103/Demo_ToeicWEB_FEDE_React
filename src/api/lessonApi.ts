import axiosInstance from './axiosConfig';

export interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  duration_minutes?: number;
  total_sections: number;
  is_free?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetLessonsResponse {
  success: boolean;
  data: {
    course_id: string;
    course_title: string;
    is_enrolled: boolean;
    lessons: Lesson[];
  };
  message: string;
}

export const lessonApi = {
  // GET /api/student/courses/:courseId/lessons - Lấy lessons của một course
  getLessonsByCourseId: async (courseId: string): Promise<GetLessonsResponse> => {
    const response = await axiosInstance.get(`/student/courses/${courseId}/lessons`);
    return response.data;
  },
};
