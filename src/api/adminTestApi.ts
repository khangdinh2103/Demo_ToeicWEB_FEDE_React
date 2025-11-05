import axiosInstance from './axiosConfig';

// ==================== INTERFACES ====================

export interface AdminTest {
  _id: string;
  title: string;
  year?: number;
  source?: string;
  audioUrl?: string;
  time_limit?: number;
  passing_score?: number;
  is_published: boolean;
  parts?: TestPart[];
  createdAt: string;
  updatedAt: string;
}

export interface TestPart {
  partNumber: number;
  questionIds: string[];
}

// ==================== REQUEST DTOs ====================

export interface CreateTestRequest {
  title: string;
  year?: number;
  source?: string;
  audioUrl?: string;
  time_limit?: number;
  passing_score?: number;
  parts?: TestPart[];
}

export interface UpdateTestRequest {
  title?: string;
  year?: number;
  source?: string;
  audioUrl?: string;
  time_limit?: number;
  passing_score?: number;
  is_published?: boolean;
  parts?: TestPart[];
}

export interface PublishTestRequest {
  is_published: boolean;
}

export interface GetTestsQuery {
  page?: number;
  limit?: number;
  year?: number;
  source?: string;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  audio?: string;
  image?: string;
  contextHtml?: string;
  transcript?: string;
  options?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  answer?: string;
  explanation?: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ==================== API FUNCTIONS ====================

export const adminTestApi = {
  /**
   * GET /api/admin/tests - Lấy tất cả đề thi (bao gồm chưa publish)
   */
  getAllTests: async (query?: GetTestsQuery): Promise<PaginatedResponse<AdminTest>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<AdminTest>>>('/admin/tests', {
      params: {
        page: query?.page || 1,
        limit: query?.limit || 100,
        year: query?.year,
        source: query?.source,
      },
    });
    return response.data.data;
  },

  /**
   * POST /api/admin/tests - Tạo đề thi mới
   */
  createTest: async (data: CreateTestRequest): Promise<AdminTest> => {
    const response = await axiosInstance.post<ApiResponse<AdminTest>>('/admin/tests', data);
    return response.data.data;
  },

  /**
   * PUT /api/admin/tests/:id - Cập nhật đề thi
   */
  updateTest: async (id: string, data: UpdateTestRequest): Promise<AdminTest> => {
    const response = await axiosInstance.put<ApiResponse<AdminTest>>(`/admin/tests/${id}`, data);
    return response.data.data;
  },

  /**
   * PUT /api/admin/tests/:id/publish - Xuất bản/ẩn đề thi
   */
  publishTest: async (id: string, is_published: boolean): Promise<AdminTest> => {
    const response = await axiosInstance.put<ApiResponse<AdminTest>>(`/admin/tests/${id}/publish`, {
      is_published,
    });
    return response.data.data;
  },

  /**
   * GET /api/student/tests/:id - Lấy chi tiết đề thi (dùng tạm cho admin)
   */
  getTestById: async (id: string): Promise<AdminTest> => {
    const response = await axiosInstance.get<ApiResponse<AdminTest>>(`/student/tests/${id}`);
    return response.data.data;
  },

  /**
   * GET /api/student/tests/:id/questions - Lấy đề thi kèm questions (dùng cho admin editor)
   */
  getTestWithQuestions: async (id: string): Promise<any> => {
    const response = await axiosInstance.get<ApiResponse<any>>(`/student/tests/${id}/questions`);
    return response.data.data;
  },

  /**
   * GET /api/student/tests/:id/answers - Lấy đề thi kèm answers và explanation (dùng cho admin)
   */
  getTestWithAnswers: async (id: string): Promise<any> => {
    const response = await axiosInstance.get<ApiResponse<any>>(`/student/tests/${id}/answers`);
    return response.data.data;
  },

  /**
   * DELETE /api/admin/tests/:id - Xóa đề thi
   */
  deleteTest: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(`/admin/tests/${id}`);
    return response.data.data;
  },

  /**
   * POST /api/admin/tests/:testId/questions - Tạo câu hỏi mới
   */
  createQuestion: async (testId: string, data: {
    part: number;
    questionNumber: number;
    questionText: string;
    audio?: string;
    image?: string;
    contextHtml?: string;
    transcript?: string;
    options?: { A?: string; B?: string; C?: string; D?: string };
    answer: string;
    explanation?: string;
  }): Promise<any> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/admin/tests/${testId}/questions`, data);
    return response.data.data;
  },

  /**
   * PUT /api/admin/tests/:testId/questions/:questionId - Cập nhật câu hỏi
   */
  updateQuestion: async (testId: string, questionId: string, data: UpdateQuestionRequest): Promise<any> => {
    const response = await axiosInstance.put<ApiResponse<any>>(`/admin/tests/${testId}/questions/${questionId}`, data);
    return response.data.data;
  },

  /**
   * POST /api/admin/tests/upload-media - Upload audio/image file
   */
  uploadMediaFile: async (file: File, type: 'audio' | 'image'): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axiosInstance.post<ApiResponse<{ url: string }>>('/admin/tests/upload-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};

export default adminTestApi;
