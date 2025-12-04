import axios from './axiosConfig'

const API_BASE_URL = '/admin/roadmaps'

export interface RoadmapItem {
  _id: string
  title: string
  description?: string
  skill_groups: string[]
  target_score: number
  courses: string[] // Array of course IDs
  price: number
  discount_percentage: number
  is_published: boolean
  total_enrollments: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateRoadmapRequest {
  title: string
  description?: string
  skill_groups: string[]
  target_score: number
  courses: string[]
  price: number
  discount_percentage?: number
  is_published?: boolean
}

export interface UpdateRoadmapRequest {
  title?: string
  description?: string
  skill_groups?: string[]
  target_score?: number
  courses?: string[]
  price?: number
  discount_percentage?: number
  is_published?: boolean
}

export const adminRoadmapApi = {
  // GET /admin/roadmap - Lấy tất cả roadmaps
  getAllRoadmaps: async (params?: { limit?: number; page?: number }) => {
    const response = await axios.get(API_BASE_URL, { params })
    return response.data
  },

  // GET /admin/roadmap/:id - Lấy chi tiết roadmap
  getRoadmapById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`)
    return response.data
  },

  // POST /admin/roadmap - Tạo roadmap mới
  createRoadmap: async (data: CreateRoadmapRequest) => {
    const response = await axios.post(API_BASE_URL, data)
    return response.data
  },

  // PATCH /admin/roadmap/:id - Cập nhật roadmap
  updateRoadmap: async (id: string, data: UpdateRoadmapRequest) => {
    const response = await axios.patch(`${API_BASE_URL}/${id}`, data)
    return response.data
  },

  // DELETE /admin/roadmap/:id - Xóa roadmap
  deleteRoadmap: async (id: string) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`)
    return response.data
  },

  // PATCH /admin/roadmap/:id/publish - Xuất bản/ẩn roadmap
  publishRoadmap: async (id: string, isPublished: boolean) => {
    const response = await axios.patch(`${API_BASE_URL}/${id}/publish`, { is_published: isPublished })
    return response.data
  },

  // PATCH /admin/roadmaps/:id/reorder-courses - Thay đổi thứ tự courses
  reorderCourses: async (id: string, courseOrders: Array<{ course_id: string; order: number }>) => {
    const response = await axios.patch(`${API_BASE_URL}/${id}/reorder-courses`, { course_orders: courseOrders })
    return response.data
  }
}
