import axios from 'axios';

// Prefer Vite dev proxy in development to avoid CORS
const isBrowser = typeof window !== 'undefined';
const isDevServer = isBrowser && window.location.port === '5173';
const baseURL = isDevServer
  ? '/api' // use Vite proxy
  : (import.meta.env.VITE_API_URL || '/api');

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      
      // Check if session was kicked out by another device
      if (errorMessage === 'SESSION_EXPIRED') {
        localStorage.removeItem('accessToken');
        localStorage.setItem('session_expired_reason', 'other_device');
        window.location.href = '/login';
      } else {
        // Regular unauthorized
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
