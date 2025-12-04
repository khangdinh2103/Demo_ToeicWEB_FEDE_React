import axiosInstance from './axiosConfig';

// ==================== INTERFACES ====================

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface RoadmapCourse {
  _id: string;
  title: string;
  thumbnail?: string;
  skill_groups: string[];
  assigned_teachers?: Array<{
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    experience_years: number;
  }>;
}

export interface Roadmap {
  _id: string;
  title: string;
  description: string;
  skill_groups: string[];
  target_score: number;
  price: number;
  discount_percentage: number;
  final_price: number;
  total_courses: number;
  total_enrollments: number;
  courses?: RoadmapCourse[];
  total_lessons?: number;
  estimated_duration?: number;
}

export interface RoadmapFilters {
  min_target_score?: number;
  max_target_score?: number;
  min_price?: number;
  max_price?: number;
  skill_groups?: string | string[];
  sortBy?: 'newest' | 'cheapest' | 'popular';
}

export const roadmapApi = {
  // Get all public roadmaps with filters
  getPublicRoadmaps: async (
    page: number = 1,
    limit: number = 10,
    filters?: RoadmapFilters
  ): Promise<PaginatedResponse<Roadmap>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Roadmap>>>(
      '/student/roadmaps',
      { params: { page, limit, ...filters } }
    );
    return response.data.data;
  },

  // Get roadmap detail by ID
  getRoadmapById: async (roadmapId: string): Promise<Roadmap> => {
    const response = await axiosInstance.get<ApiResponse<Roadmap>>(
      `/student/roadmaps/${roadmapId}`
    );
    return response.data.data;
  },
};
