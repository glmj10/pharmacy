import api from './api';
import { UserTransform } from '../utils/dataTransform';

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

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

  changePassword: async (passwordData) => {
    const requestData = UserTransform.toBackendPasswordRequest(passwordData);
    const response = await api.put('/auth/password', requestData);
    return response.data;
  },
};