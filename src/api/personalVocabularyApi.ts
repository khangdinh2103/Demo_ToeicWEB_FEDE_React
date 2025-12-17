import axiosInstance from "./axiosConfig";

export interface PersonalVocabulary {
    _id: string;
    user_id: string;
    word: string;
    definition: string;
    example?: string;
    translation?: string;
    phonetic?: string;
    audioUrl?: string;
    part_of_speech?: string;
    source?: string;
    source_id?: string;
    source_type?: string;
    notes?: string;
    mastery_level: number;
    times_reviewed: number;
    last_reviewed?: string;
    tags?: string[];
    is_favorite: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AddWordDTO {
    word: string;
    definition: string;
    example?: string;
    translation?: string;
    phonetic?: string;
    audioUrl?: string;
    part_of_speech?: string;
    source?: string;
    source_id?: string;
    source_type?: string;
    notes?: string;
    tags?: string[];
}

export interface VocabularyStats {
    total: number;
    favorites: number;
    reviewedToday: number;
    byMastery: Record<number, number>;
}

export const personalVocabularyApi = {
    /**     * Lấy personal vocabulary dạng VocabularySet để luyện tập
     */
    getAsVocabularySet: async (): Promise<any> => {
        const response = await axiosInstance.get("/vocabulary/personal/as-set");
        return response.data;
    },

    /**     * Auto-generate từ vựng từ AI
     */
    autoGenerateWord: async (word: string): Promise<{
        message: string;
        word: PersonalVocabulary;
        audioUK: string;
        audioUS: string;
        collocations: Array<{ phrase: string; meaning: string }>;
    }> => {
        const response = await axiosInstance.post("/vocabulary/personal/generate", { word });
        return response.data;
    },

    /**
     * Thêm từ mới vào bộ từ cá nhân
     */
    addWord: async (data: AddWordDTO): Promise<{ message: string; word: PersonalVocabulary }> => {
        const response = await axiosInstance.post("/vocabulary/personal", data);
        return response.data;
    },

    /**
     * Lấy danh sách từ cá nhân
     */
    getMyVocabulary: async (params?: {
        page?: number;
        limit?: number;
        tags?: string;
        mastery_level?: number;
        is_favorite?: boolean;
        search?: string;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        words: PersonalVocabulary[];
    }> => {
        const response = await axiosInstance.get("/vocabulary/personal", { params });
        return response.data;
    },

    /**
     * Lấy thống kê
     */
    getStatistics: async (): Promise<VocabularyStats> => {
        const response = await axiosInstance.get("/vocabulary/personal/statistics");
        return response.data;
    },

    /**
     * Cập nhật từ
     */
    updateWord: async (id: string, data: Partial<AddWordDTO>): Promise<{ message: string; word: PersonalVocabulary }> => {
        const response = await axiosInstance.put(`/vocabulary/personal/${id}`, data);
        return response.data;
    },

    /**
     * Xóa từ
     */
    deleteWord: async (id: string): Promise<{ message: string }> => {
        const response = await axiosInstance.delete(`/vocabulary/personal/${id}`);
        return response.data;
    },

    /**
     * Toggle favorite
     */
    toggleFavorite: async (id: string): Promise<{ message: string; word: PersonalVocabulary }> => {
        const response = await axiosInstance.post(`/vocabulary/personal/${id}/favorite`);
        return response.data;
    },

    /**
     * Đánh dấu đã ôn
     */
    markAsReviewed: async (id: string, masteryLevel?: number): Promise<{ message: string; word: PersonalVocabulary }> => {
        const response = await axiosInstance.post(`/vocabulary/personal/${id}/review`, {
            mastery_level: masteryLevel
        });
        return response.data;
    },

    /**
     * Lấy từ cần ôn
     */
    getWordsToReview: async (limit?: number): Promise<PersonalVocabulary[]> => {
        const response = await axiosInstance.get("/vocabulary/personal/review", {
            params: { limit }
        });
        return response.data;
    },

    /**
     * Lấy tất cả tags
     */
    getAllTags: async (): Promise<Array<{ tag: string; count: number }>> => {
        const response = await axiosInstance.get("/vocabulary/personal/tags");
        return response.data;
    }
};
