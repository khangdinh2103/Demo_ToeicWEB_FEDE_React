import axiosInstance from './axiosConfig'

export interface User {
  _id: string
  name: string
  phone?: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  gender: 'male' | 'female' | 'other'
  date_of_birth?: string
  address?: string
  country?: string
  last_login?: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  
  // Additional student info
  level?: string
  target_score?: number
  coursesEnrolled?: number
  enrollment_date?: string
  
  // Additional teacher info
  bio?: string
  experience?: number
  coursesTeaching?: number
}

export interface UserStats {
  total: number
  students: number
  teachers: number
  active: number
  inactive: number
  pending: number
  newThisMonth: number
}

export interface GetUsersParams {
  role?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface GetUsersResponse {
  users: User[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateUserData {
  name: string
  phone: string
  password: string
  role: 'student' | 'teacher'
  gender: 'male' | 'female' | 'other'
  date_of_birth?: string
  address?: string
  country?: string
}

const adminUserApi = {
  // Get all users with filters
  getUsers: async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    const response = await axiosInstance.get('/admin/users', { params })
    return response.data.data
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await axiosInstance.get('/admin/users/stats')
    return response.data.data
  },

  // Create new user
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await axiosInstance.post('/admin/users', data)
    return response.data.data
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/admin/users/${id}`)
    return response.data.data
  },

  // Update user status
  updateUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response = await axiosInstance.patch(`/admin/users/${id}/status`, { isActive })
    return response.data.data
  },

  // Update user information
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data)
    return response.data.data
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}`)
  }
}

export default adminUserApi
