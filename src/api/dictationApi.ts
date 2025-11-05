import axiosInstance from "./axiosConfig";

// Types
export interface IWord {
    word: string;
    meaning: string;
}

export interface IDictationBreak {
    breakNumber: number;
    startTime: number; // seconds
    endTime: number;   // seconds
    originalText: string;
    textTranslation: string;
    words: IWord[];
}

export interface Dictation {
    _id: string;
    title: string;
    youtubeVideoId: string;
    lessonTranslation: string;
    breaks: IDictationBreak[];
    createdAt?: string;
    updatedAt?: string;
    is_locked?: boolean; // For students
}

export const dictationApi = {
    // Get all dictation lessons for students (10 free, rest locked)
    getAllDictations: async () => {
        const response = await axiosInstance.get('/student/dictations');
        return response.data?.data;
    },

    // Get dictation detail by ID
    getDictationById: async (dictationId: string) => {
        const response = await axiosInstance.get(`/student/dictations/${dictationId}`);
        return response.data?.data;
    },

    // Submit dictation attempt (optional - for progress tracking)
    submitDictationAttempt: async (dictationId: string, data: {
        breakNumber: number;
        userAnswer: string;
        isCorrect: boolean;
    }) => {
        const response = await axiosInstance.post(`/student/dictations/${dictationId}/attempts`, data);
        return response.data?.data;
    }
};
