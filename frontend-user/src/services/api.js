import axios from 'axios';
import { modalEvents } from '../utils/modalEvents';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Không hiển thị thông báo lỗi nếu đang gọi logout
      const isLogoutRequest = error.config?.url?.includes('/auth/logout');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chỉ hiển thị thông báo nếu không phải logout
      if (!isLogoutRequest) {
        modalEvents.triggerAuthExpired('token_expired', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
