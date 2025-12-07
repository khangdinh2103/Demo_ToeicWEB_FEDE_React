import axiosInstance from './axiosConfig'

export interface OverviewParams {
  year?: number
  month?: number
}

export interface ChartParams {
  period: 'day' | 'week' | 'month' | 'quarter'
  range: number
}

export interface EnrollmentsChartParams extends ChartParams {
  by?: 'roadmap'
  top?: number
}

export interface TopRoadmapsParams {
  limit?: number
  metric?: string
}

export interface UserOverview {
  totalUsers: number
  newUsersThisMonth: number
  growthPct: number
}

export interface EnrollmentOverview {
  enrollmentsThisMonth: number
  pctChange: number
  topRoadmap?: {
    roadmapId: string
    title?: string
    enrollments: number
  } | null
}

export interface TimeSeriesItem {
  periodStart: string
  revenue?: number
  orders?: number
  newUsers?: number
  enrollments?: number
  breakdown?: {
    roadmapId: string
    title: string
    enrollments: number
  }[]
}

export interface TopRoadmapItem {
  roadmapId: string
  title: string
  enrollments: number
  revenue: number
  average_rating: number
}

// GET /admin/statistics/user-overview
export const getUserOverview = async (params?: OverviewParams): Promise<UserOverview> => {
  const response = await axiosInstance.get('/admin/statistics/user-overview', { params })
  return response.data.data
}

// GET /admin/statistics/enrollment-overview
export const getEnrollmentOverview = async (params?: OverviewParams): Promise<EnrollmentOverview> => {
  const response = await axiosInstance.get('/admin/statistics/enrollment-overview', { params })
  return response.data.data
}

// GET /admin/statistics/revenue-chart
export const getRevenueChart = async (params: ChartParams): Promise<TimeSeriesItem[]> => {
  const response = await axiosInstance.get('/admin/statistics/revenue-chart', { params })
  return response.data.data
}

// GET /admin/statistics/new-users-chart
export const getNewUsersChart = async (params: ChartParams): Promise<TimeSeriesItem[]> => {
  const response = await axiosInstance.get('/admin/statistics/new-users-chart', { params })
  return response.data.data
}

// GET /admin/statistics/enrollments-chart
export const getEnrollmentsChart = async (params: EnrollmentsChartParams): Promise<TimeSeriesItem[]> => {
  const response = await axiosInstance.get('/admin/statistics/enrollments-chart', { params })
  return response.data.data
}

// GET /admin/statistics/top-roadmaps
export const getTopRoadmaps = async (params?: TopRoadmapsParams): Promise<TopRoadmapItem[]> => {
  const response = await axiosInstance.get('/admin/statistics/top-roadmaps', { params })
  return response.data.data.data
}
