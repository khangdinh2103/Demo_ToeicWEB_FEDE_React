import axiosInstance from './axiosConfig';

export interface CreateCourseRequest {
  title: string;
  description?: string;
  short_description?: string;
  thumbnail?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  skill_groups?: string[];
  price?: number;
  original_price?: number;
  is_free?: boolean;
  order?: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  short_description?: string;
  thumbnail?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  skill_groups?: string[];
  price?: number;
  original_price?: number;
  is_free?: boolean;
  order?: number;
}

export interface CreateLessonRequest {
  course_id: string;
  title: string;
  description?: string;
  order: number;
  is_free?: boolean;
  created_by: string;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  order?: number;
  is_free?: boolean;
}

export interface CreateSectionRequest {
  lesson_id: string;
  title: string;
  description?: string;
  order: number;
  type: 'video' | 'audio' | 'article' | 'quiz' | 'exercise' | 'mindmap';
  video_url?: string;
  audio_url?: string;
  article_content?: string;
  mindmap_url?: string;
  test_id?: string;
  duration_minutes?: number;
}

export interface UpdateSectionRequest {
  title?: string;
  description?: string;
  order?: number;
  type?: 'video' | 'audio' | 'article' | 'quiz' | 'exercise' | 'mindmap';
  video_url?: string;
  audio_url?: string;
  article_content?: string;
  mindmap_url?: string;
  test_id?: string;
  duration_minutes?: number;
}

export const adminCourseApi = {
  // Course APIs
  getAllCourses: async (params?: { page?: number; limit?: number; is_published?: boolean }) => {
    const response = await axiosInstance.get('/admin/courses', { params });
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await axiosInstance.get(`/admin/courses/${id}`);
    return response.data.data || response.data;
  },

  createCourse: async (data: CreateCourseRequest) => {
    const response = await axiosInstance.post('/admin/courses', data);
    return response.data.data;
  },

  updateCourse: async (id: string, data: UpdateCourseRequest) => {
    const response = await axiosInstance.patch(`/admin/courses/${id}`, data);
    return response.data.data;
  },

  deleteCourse: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/courses/${id}`);
    return response.data;
  },

  publishCourse: async (id: string, is_published: boolean) => {
    const response = await axiosInstance.patch(`/admin/courses/${id}/publish`, { is_published });
    return response.data;
  },

  // Lesson APIs
  getLessonsByCourseId: async (courseId: string) => {
    const response = await axiosInstance.get(`/admin/courses/${courseId}/lessons`);
    return response.data.data || response.data;
  },

  createLesson: async (data: CreateLessonRequest) => {
    const response = await axiosInstance.post('/admin/lessons', data);
    return response.data.data;
  },

  updateLesson: async (id: string, data: UpdateLessonRequest) => {
    const response = await axiosInstance.patch(`/admin/lessons/${id}`, data);
    return response.data.data;
  },

  deleteLesson: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/lessons/${id}`);
    return response.data;
  },

  // Section APIs
  getSectionsByLessonId: async (lessonId: string) => {
    const response = await axiosInstance.get(`/admin/lessons/${lessonId}/sections`);
    return response.data.data || response.data;
  },

  createSection: async (data: CreateSectionRequest) => {
    const response = await axiosInstance.post('/admin/sections', data);
    return response.data.data;
  },

  updateSection: async (id: string, data: UpdateSectionRequest) => {
    const response = await axiosInstance.patch(`/admin/sections/${id}`, data);
    return response.data.data;
  },

  deleteSection: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/sections/${id}`);
    return response.data;
  },

  // Reorder APIs
  reorderLessons: async (courseId: string, lessonOrders: Array<{ lesson_id: string; order: number }>) => {
    const response = await axiosInstance.patch(`/admin/courses/${courseId}/reorder-lessons`, { lesson_orders: lessonOrders });
    return response.data;
  },

  reorderSections: async (lessonId: string, sectionOrders: Array<{ section_id: string; order: number }>) => {
    const response = await axiosInstance.patch(`/admin/lessons/${lessonId}/reorder-sections`, { section_orders: sectionOrders });
    return response.data;
  },

  // Upload media
  uploadMedia: async (file: File, type: 'audio' | 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await axiosInstance.post('/admin/tests/upload-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
