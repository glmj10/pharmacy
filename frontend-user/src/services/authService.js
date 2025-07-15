import api from './api';
import { AuthTransform } from '../utils/dataTransform';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Backend trả về: ApiResponse<AuthResponse>
    // response.data = { status, message, data: { token }, timestamp }
    
    // Validate response structure
    if (!response.data || !response.data.data || !response.data.data.token) {
      throw new Error('Invalid login response from server');
    }
    
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Backend trả về: ApiResponse<UserResponse>
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    // Backend trả về: ApiResponse<UserResponse>
    return response.data;
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      await api.post('/auth/logout');
      return { success: true, message: 'Đăng xuất thành công!' };
    } catch (error) {
      console.log('Logout API failed (ignored):', error.message);
      return { success: true, message: 'Đăng xuất thành công!' };
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  refreshToken: async (refreshData) => {
    const response = await api.post('/auth/refresh-token', refreshData);
    if (!response.data || !response.data.data || !response.data.data.token) {
      throw new Error('Token không hợp lệ');
    }
    
    return AuthTransform(response.data);
  }
};
