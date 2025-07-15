import api from './api';
import { UserTransform } from '../utils/dataTransform';

export const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update user information (username only, email không được update)
  updateUser: async (userData) => {
    const requestData = {
      username: userData.username,
      email: userData.email
    };
    
    const formData = new FormData();
    formData.append('info', new Blob([JSON.stringify(requestData)], {
      type: 'application/json'
    }));

    const response = await api.put('/auth/info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update user information with profile picture
  updateUserWithAvatar: async (userInfo, profilePic) => {
    const formData = new FormData();
    
    if (userInfo) {
      const requestData = UserTransform.toBackendUserInfo(userInfo);
      formData.append('info', new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
      }));
    }
    
    if (profilePic) {
      formData.append('profilePic', profilePic);
    }

    const response = await api.put('/auth/info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update profile picture only
  updateProfilePicture: async (profilePic) => {
    const formData = new FormData();
    formData.append('profilePic', profilePic);

    const response = await api.put('/auth/info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const requestData = UserTransform.toBackendPasswordRequest(passwordData);
    const response = await api.put('/auth/password', requestData);
    return response.data;
  },
};