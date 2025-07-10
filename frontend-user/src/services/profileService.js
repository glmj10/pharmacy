import api from './api';

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profiles');
    return response.data;
  },

  createProfile: async (profileData) => {
    const response = await api.post('/profiles', profileData);
    return response.data;
  },

  updateProfile: async (profileId, profileData) => {
    const response = await api.put(`/profiles/${profileId}`, profileData);
    return response.data;
  }
};
