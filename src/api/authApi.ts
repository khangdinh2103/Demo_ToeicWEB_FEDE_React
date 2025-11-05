import axiosInstance from './axiosConfig';

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: File;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface AuthResponse {
  _id: string;
  phone: string;
  name: string;
  gender: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  access_token: string;  // Changed from accessToken
  refresh_token: string; // Changed from refreshToken
}

export interface RegisterResponse {
  _id: string;
  phone: string;
  name: string;
  gender: string;
  role: string;
  isVerified: boolean;
  pinId?: string;
}

export const authApi = {
  // Đăng ký tài khoản student
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const formData = new FormData();
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('name', data.name);
    formData.append('gender', data.gender);
    
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    const response = await axiosInstance.post('/student/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Xác thực OTP
  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/student/auth/verify-account', data);
    
    // Lưu tokens vào localStorage
    if (response.data.data.access_token) {
      localStorage.setItem('accessToken', response.data.data.access_token);
      localStorage.setItem('refreshToken', response.data.data.refresh_token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.data._id,
        name: response.data.data.name,
        phone: response.data.data.phone,
        role: response.data.data.role,
        avatar: response.data.data.avatar,
      }));
    }
    
    return response.data.data;
  },

  // Đăng nhập Student
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/student/auth/login', data);
    
    console.log('🔍 Student API raw response:', response.data);
    
    // Lưu tokens vào localStorage
    if (response.data.data.access_token) {
      localStorage.setItem('accessToken', response.data.data.access_token);
      localStorage.setItem('refreshToken', response.data.data.refresh_token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.data._id,
        name: response.data.data.name,
        phone: response.data.data.phone,
        role: response.data.data.role,
        avatar: response.data.data.avatar,
      }));
    }
    
    console.log('✅ Student API returning:', response.data.data);
    return response.data.data;
  },

  // Đăng nhập Admin
  adminLogin: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/admin/auth/login', data);
    
    console.log('🔍 Admin API raw response:', response.data);
    
    // Lưu tokens vào localStorage
    if (response.data.data.access_token) {
      localStorage.setItem('accessToken', response.data.data.access_token);
      localStorage.setItem('refreshToken', response.data.data.refresh_token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.data._id,
        name: response.data.data.name,
        phone: response.data.data.phone,
        role: response.data.data.role,
        avatar: response.data.data.avatar,
      }));
    }
    
    console.log('✅ Admin API returning:', response.data.data);
    return response.data.data;
  },

  // Đăng xuất
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axiosInstance.post('/student/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Xóa tokens khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Làm mới token
  refreshToken: async (): Promise<{ access_token: string; refresh_token: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axiosInstance.post('/student/auth/refresh-token', { refresh_token: refreshToken });
    
    // Cập nhật tokens mới
    localStorage.setItem('accessToken', response.data.data.access_token);
    localStorage.setItem('refreshToken', response.data.data.refresh_token);
    
    return response.data.data;
  },

  // Lấy thông tin user hiện tại từ localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};
