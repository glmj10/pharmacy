import api from './api';
import { ProfileTransform } from '../utils/dataTransform';

export const profileService = {
  // Get all user profiles (shipping addresses)
  getUserProfiles: async () => {
    const response = await api.get('/profiles');
    return response.data;
  },

  // Get profile by ID
  getProfileById: async (profileId) => {
    const response = await api.get(`/profiles/${profileId}`);
    return response.data;
  },

  // Create new profile (shipping address)
  createProfile: async (profileData) => {
    // Transform to backend format
    const requestData = ProfileTransform.toBackendRequest(profileData);
    
    const response = await api.post('/profiles', requestData);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileId, profileData) => {
    const requestData = ProfileTransform.toBackendRequest(profileData);
    
    const response = await api.put(`/profiles/${profileId}`, requestData);
    return response.data;
  },

  // Delete profile
  deleteProfile: async (profileId) => {
    const response = await api.delete(`/profiles/${profileId}`);
    return response.data;
  }
};
