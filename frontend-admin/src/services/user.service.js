import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class UserService {
    async getAllUsers(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.USERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getUserById(id) {
        try {
            const response = await api.get(ENDPOINTS.USERS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createUser(userData) {
        try {
            const response = await api.post(ENDPOINTS.USERS.CREATE, userData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getProfile() {
        try {
            const response = await api.get(ENDPOINTS.USERS.PROFILE);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getCurrentUser() {
        try {
            const response = await api.get(ENDPOINTS.USERS.USER_INFO);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getUsers(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.USERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async changeUserRole(userId, roleCodes) {
        try {
            const response = await api.put(`/users/role/${userId}`, {
                roleCodes: roleCodes
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new UserService();