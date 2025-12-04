import axiosInstance from './axiosConfig';

export interface Teacher {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  specialization?: string;
  bio?: string;
  isActive: boolean;
}

export const adminTeacherApi = {
  // Get all teachers
  getTeacherList: async (params?: { page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/admin/teachers', { params });
    return response.data;
  },
};