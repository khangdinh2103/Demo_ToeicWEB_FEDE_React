import axios from './axiosConfig';

export interface RecommendationInput {
  currentScore: number;
  targetScore: number;
  daysPerWeek: number;
  minHoursPerDay: number;
  maxHoursPerDay: number;
  focusSkills: string[];
}

export interface DailySession {
  courseTitle: string;
  lessonTitle: string;
  sectionTitle: string;
  duration: number;
  type: string;
}

export interface DailyPlan {
  day: number;
  date: string;
  sessions: DailySession[];
  totalMinutes: number;
}

export interface RecommendedRoadmap {
  roadmap: any; // Roadmap object from backend
  courses: any[]; // Course objects with lessons and sections
  totalDuration: number;
  estimatedWeeks: number;
  estimatedCompletionDate: string;
  studySchedule: {
    hoursPerDay: number;
    daysPerWeek: number;
    totalDays: number;
  };
  dailyPlan: DailyPlan[];
}

export interface RecommendationResult {
  recommendedRoadmaps: RecommendedRoadmap[];
  totalEstimatedWeeks: number;
  totalCost: number;
  totalCostAfterDiscount: number;
  message: string;
  tips: string[];
}

export interface QuickEstimateInput {
  currentScore: number;
  targetScore: number;
  availableHoursPerWeek: number;
}

export interface QuickEstimateResult {
  scoreDifference: number;
  estimatedTotalHours: number;
  estimatedWeeks: number;
  recommendedSchedule: {
    daysPerWeek: number;
    hoursPerDay: number;
  };
}

export const roadmapRecommendationApi = {
  // Gợi ý lộ trình học chi tiết
  async getRecommendations(input: RecommendationInput): Promise<RecommendationResult> {
    const response = await axios.post<{ success: boolean; data: RecommendationResult }>('/roadmaps/recommend', input);
    return response.data.data;
  },

  // Lấy lịch học chi tiết cho 1 roadmap
  async getDetailedSchedule(
    roadmapId: string,
    daysPerWeek: number,
    minHoursPerDay: number,
    maxHoursPerDay: number
  ) {
    const response = await axios.get(`/roadmaps/${roadmapId}/schedule`, {
      params: { daysPerWeek, minHoursPerDay, maxHoursPerDay }
    });
    return response.data.data;
  },

  // Ước tính nhanh thời gian học
  async getQuickEstimate(input: QuickEstimateInput): Promise<QuickEstimateResult> {
    const response = await axios.post<{ success: boolean; data: QuickEstimateResult }>('/roadmaps/quick-estimate', input);
    return response.data.data;
  }
};
