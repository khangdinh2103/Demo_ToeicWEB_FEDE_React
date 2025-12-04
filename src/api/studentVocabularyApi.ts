import axiosInstance from "./axiosConfig";

export interface StudentVocabularySet {
    _id: string;
    title: string;
    description?: string;
    topic: string;
    total_cards: number;
    createdAt: string;
}

export interface StudentVocabularySetDetail {
    _id: string;
    title: string;
    description?: string;
    topic: string;
    cards: Array<{
        _id: string;
        term: string;
        mainMeaning: string;
        example?: string;
        ipa?: string;
        collocations?: Array<{
            phrase: string;
            meaning: string;
        }>;
        audioUS_url?: string;
        audioUK_url?: string;
    }>;
    createdAt: string;
}

export interface GenerateVocabularySetRequest {
    topic: string;
    count?: number; // Mặc định 15
}

/**
 * Tạo set từ vựng mới bằng AI theo chủ đề
 */
export const generateVocabularySet = async (
    request: GenerateVocabularySetRequest
): Promise<StudentVocabularySetDetail> => {
    const response = await axiosInstance.post("/student/vocabulary/generate", request);
    return response.data.data;
};

/**
 * Lấy tất cả set từ vựng cá nhân của student
 */
export const getMyCustomVocabularySets = async (): Promise<{
    total: number;
    data: StudentVocabularySet[];
}> => {
    const response = await axiosInstance.get("/student/vocabulary/my-sets");
    return response.data.data;
};

/**
 * Lấy chi tiết 1 set từ vựng cá nhân
 */
export const getMyCustomVocabularySetById = async (
    setId: string
): Promise<StudentVocabularySetDetail> => {
    const response = await axiosInstance.get(`/student/vocabulary/my-sets/${setId}`);
    return response.data.data;
};

/**
 * Xóa set từ vựng cá nhân
 */
export const deleteMyCustomVocabularySet = async (setId: string): Promise<void> => {
    await axiosInstance.delete(`/student/vocabulary/my-sets/${setId}`);
};
