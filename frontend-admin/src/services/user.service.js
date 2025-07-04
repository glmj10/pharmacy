import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class UserService {
    /**
     * Get all users
     * @param {Object} params - Query parameters (page, size, sort, etc.)
     * @returns {Promise<ApiResponse>}
     */
    async getAllUsers(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.USERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get user by ID
     * @param {string|number} id - User ID
     * @returns {Promise<ApiResponse>}
     */
    async getUserById(id) {
        try {
            const response = await api.get(ENDPOINTS.USERS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new user
     * @param {Object} userData - User data
     * @returns {Promise<ApiResponse>}
     */
    async createUser(userData) {
        try {
            const response = await api.post(ENDPOINTS.USERS.CREATE, userData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get current user profile
     * @returns {Promise<ApiResponse>}
     */
    async getProfile() {
        try {
            const response = await api.get(ENDPOINTS.USERS.PROFILE);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get current user info
     * @returns {Promise<ApiResponse>}
     */
    async getCurrentUser() {
        try {
            const response = await api.get(ENDPOINTS.USERS.USER_INFO);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get all users for admin (paginated)
     * @param {Object} params - Query parameters
     * @returns {Promise<ApiResponse>}
     */
    async getUsers(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.USERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }


    /**
     * Change user roles
     * @param {string|number} userId - User ID
     * @param {Array<string>} roleCodes - Array of role codes
     * @returns {Promise<ApiResponse>}
     */
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