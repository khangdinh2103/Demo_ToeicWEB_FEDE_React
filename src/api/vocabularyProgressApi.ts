import axiosInstance from './axiosConfig';

export interface MarkWordLearnedRequest {
  set_id: string;
  word_id: string;
  recorded?: boolean;
}

export interface VocabularyProgress {
  _id?: string;
  set_id: string;
  set_name?: string;
  learned_words: Array<{
    word_id: string;
    learned_at: Date;
    recorded: boolean;
  }>;
  completion_percentage: number;
  is_completed: boolean;
  last_practiced?: Date;
  total_words: number;
  learned_count: number;
}

export const vocabularyProgressApi = {
  // Đánh dấu từ đã học
  markWordLearned: async (data: MarkWordLearnedRequest) => {
    const response = await axiosInstance.post('/student/vocabulary/progress/mark-learned', data);
    return response.data;
  },

  // Lấy tiến độ học của một set
  getProgress: async (setId: string) => {
    const response = await axiosInstance.get(`/student/vocabulary/progress/${setId}`);
    return response.data;
  },

  // Lấy tất cả tiến độ học
  getAllProgress: async () => {
    const response = await axiosInstance.get('/student/vocabulary/progress');
    return response.data;
  },
};
