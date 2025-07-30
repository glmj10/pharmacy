import api from './api';
import { ProfileTransform } from '../utils/dataTransform';

export const profileService = {
  getUserProfiles: async () => {
    const response = await api.get('/profiles');
    return response.data;
  },

  getProfileById: async (profileId) => {
    const response = await api.get(`/profiles/${profileId}`);
    return response.data;
  },

  createProfile: async (profileData) => {
    const requestData = ProfileTransform.toBackendRequest(profileData);
    
    const response = await api.post('/profiles', requestData);
    return response.data;
  },

  updateProfile: async (profileId, profileData) => {
    const requestData = ProfileTransform.toBackendRequest(profileData);
    
    const response = await api.put(`/profiles/${profileId}`, requestData);
    return response.data;
  },

  deleteProfile: async (profileId) => {
    const response = await api.delete(`/profiles/${profileId}`);
    return response.data;
  }
};
