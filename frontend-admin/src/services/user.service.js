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
     * Update user
     * @param {string|number} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<ApiResponse>}
     */
    async updateUser(id, userData) {
        try {
            const response = await api.put(ENDPOINTS.USERS.UPDATE(id), userData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Delete user
     * @param {string|number} id - User ID
     * @returns {Promise<ApiResponse>}
     */
    async deleteUser(id) {
        try {
            const response = await api.delete(ENDPOINTS.USERS.DELETE(id));
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
            const response = await api.get('/users', { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Update user status
     * @param {string|number} id - User ID
     * @param {string} status - New status
     * @returns {Promise<ApiResponse>}
     */
    async updateUserStatus(id, status) {
        try {
            const response = await api.put(`/users/status/${id}`, null, {
                params: { status }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new UserService();