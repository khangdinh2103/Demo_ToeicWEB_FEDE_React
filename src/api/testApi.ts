import axiosInstance from './axiosConfig';

// ==================== INTERFACES ====================

export interface Test {
  _id: string;
  title: string;
  year: number;
  source: string;
  audioUrl?: string;
  time_limit: number;
  passing_score: number;
  is_published: boolean;
  parts: TestPart[];
  createdAt: string;
  updatedAt: string;
}

export interface TestPart {
  partNumber: number;
  questionIds: string[];
}

export interface Question {
  _id: string;
  part: number;
  type: 'single' | 'group';
  questionNumber: number;
  groupNumber?: number;
  audio?: string;
  image?: string;
  questionText?: string;
  passage?: string;
  contextHtml?: string;
  transcript?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer?: string; // Chỉ có khi xem đáp án
  explanation?: string; // Chỉ có khi xem đáp án
  subQuestions?: Question[]; // Cho group type
}

export interface TestWithQuestions {
  test: {
    _id: string;
    title: string;
    year: number;
    source: string;
    audioUrl?: string;
    time_limit: number;
    passing_score: number;
  };
  parts?: {
    partNumber: number;
    totalQuestions: number;
    questions: Question[];
  }[];
  part?: {
    partNumber: number;
    totalQuestions: number;
  };
  questions?: Question[];
  totalQuestions?: number;
}

export interface TestAttempt {
  _id: string;
  user_id: string;
  test_id: string;
  started_at: string;
  completed_at?: string;
  answers: TestAnswer[];
  current_part?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  listening_score?: number;
  reading_score?: number;
  total_score?: number;
  correct_answers?: number;
  total_questions: number;
  time_limit: number;
  time_used?: number;
}

export interface TestAnswer {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_spent: number;
}

export interface TestResult {
  attempt_id: string;
  correct_answers: number;
  total_questions: number;
  listening_score: number;
  reading_score: number;
  total_score: number;
  time_used: number;
  completed_at: string;
}

// ==================== REQUEST DTOs ====================

export interface GetTestsParams {
  page?: number;
  limit?: number;
  year?: number;
  source?: string;
}

export interface StartTestRequest {
  test_id: string;
}

export interface SubmitAnswerRequest {
  attempt_id: string;
  question_id: string;
  selected_answer: string;
  time_spent: number;
}

export interface UpdateCurrentPartRequest {
  attempt_id: string;
  part_number: number;
}

export interface CompleteTestRequest {
  attempt_id: string;
  time_used?: number;
}

export interface AbandonTestRequest {
  attempt_id: string;
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

export const testApi = {
  // ========== STUDENT APIs ==========

  /**
   * GET /api/student/tests - Lấy danh sách đề thi
   */
  getAllTests: async (params?: GetTestsParams): Promise<PaginatedResponse<Test>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Test>>>('/student/tests', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        year: params?.year,
        source: params?.source,
      },
    });
    return response.data.data;
  },

  /**
   * GET /api/student/tests/:id - Lấy chi tiết đề thi
   */
  getTestById: async (testId: string): Promise<Test> => {
    const response = await axiosInstance.get<ApiResponse<Test>>(`/student/tests/${testId}`);
    return response.data.data;
  },

  /**
   * GET /api/student/tests/:id/questions?part=1 - Lấy đề thi kèm câu hỏi
   * @param testId - ID của test
   * @param part - Part cụ thể (1-7), nếu không có thì lấy full test
   */
  getTestWithQuestions: async (testId: string, part?: number): Promise<TestWithQuestions> => {
    const response = await axiosInstance.get<ApiResponse<TestWithQuestions>>(
      `/student/tests/${testId}/questions`,
      {
        params: part ? { part } : {},
      }
    );
    return response.data.data;
  },

  /**
   * GET /api/student/tests/:id/answers - Lấy đề thi kèm đáp án (xem sau khi làm xong)
   */
  getTestWithAnswers: async (testId: string): Promise<TestWithQuestions> => {
    const response = await axiosInstance.get<ApiResponse<TestWithQuestions>>(
      `/student/tests/${testId}/answers`
    );
    return response.data.data;
  },

  /**
   * POST /api/student/tests/start - Bắt đầu làm bài thi
   */
  startTest: async (data: StartTestRequest): Promise<{ message: string; attempt: TestAttempt }> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string; attempt: TestAttempt }>>(
      '/student/tests/start',
      data
    );
    return response.data.data;
  },

  /**
   * POST /api/student/tests/submit-answer - Lưu câu trả lời realtime
   */
  submitAnswer: async (data: SubmitAnswerRequest): Promise<{ message: string; is_correct: boolean }> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string; is_correct: boolean }>>(
      '/student/tests/submit-answer',
      data
    );
    return response.data.data;
  },

  /**
   * PUT /api/student/tests/current-part - Cập nhật part đang làm
   */
  updateCurrentPart: async (data: UpdateCurrentPartRequest): Promise<{ message: string; current_part: number }> => {
    const response = await axiosInstance.put<ApiResponse<{ message: string; current_part: number }>>(
      '/student/tests/current-part',
      data
    );
    return response.data.data;
  },

  /**
   * POST /api/student/tests/complete - Hoàn thành và nộp bài thi
   */
  completeTest: async (data: CompleteTestRequest): Promise<{ message: string; result: TestResult }> => {
    console.log('🔵 testApi.completeTest called with:', JSON.stringify(data))
    console.log('🔵 data.time_used type:', typeof data.time_used, 'value:', data.time_used)
    
    // Ensure time_used is a valid number, not null or undefined
    const payload = {
      attempt_id: data.attempt_id,
      time_used: data.time_used || 1 // Default to 1 if falsy
    }
    
    console.log('🔵 Final payload:', JSON.stringify(payload))
    
    const response = await axiosInstance.post<ApiResponse<{ message: string; result: TestResult }>>(
      '/student/tests/complete',
      payload
    );
    return response.data.data;
  },

  /**
   * GET /api/student/tests/attempts/:id - Lấy kết quả chi tiết 1 lượt thi
   */
  getAttemptResult: async (attemptId: string): Promise<TestAttempt> => {
    const response = await axiosInstance.get<ApiResponse<TestAttempt>>(
      `/student/tests/attempts/${attemptId}`
    );
    return response.data.data;
  },

  /**
   * GET /api/student/tests/attempts - Lấy lịch sử làm bài
   */
  getUserAttempts: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<TestAttempt>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<TestAttempt>>>(
      '/student/tests/attempts',
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  /**
   * POST /api/student/tests/abandon - Hủy bỏ bài thi
   */
  abandonTest: async (data: AbandonTestRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      '/student/tests/abandon',
      data
    );
    return response.data.data;
  },

  /**
   * Lấy bài kiểm tra đầu vào (Placement Test)
   * Tìm test có tên chứa "Placement Test" hoặc "Đánh giá trình độ"
   */
  getPlacementTest: async (): Promise<Test> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Test>>>('/student/tests', {
      params: { limit: 100 }
    });
    
    const placementTest = response.data.data.data.find((test: Test) => 
      test.title.includes('Placement Test') || test.title.includes('Đánh giá trình độ')
    );
    
    if (!placementTest) {
      throw new Error('Không tìm thấy bài kiểm tra đầu vào');
    }
    
    return placementTest;
  },
};

export default testApi;
