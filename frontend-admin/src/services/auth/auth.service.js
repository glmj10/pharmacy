import api from '../../config/api';
import { ENDPOINTS } from '../../config/constants';
import { apiUtils } from '../../utils/apiUtils';

class AuthService {
    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<ApiResponse>}
     */
    async register(userData) {
        try {
            const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Login user
     * @param {Object} credentials - Login credentials {email/username, password}
     * @returns {Promise<ApiResponse>}
     */
    async login(credentials) {
        try {
            const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
 * Update current user profile
 * @param {FormData} profileData - Profile data (form-data with info and profilePic)
 * @returns {Promise<ApiResponse>}
 */
    async updateInfo(profileData) {
        try {
            const response = await api.put(ENDPOINTS.AUTH.INFO, profileData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Logout user
     * @returns {Promise<ApiResponse>}
     */
    async logout() {
        try {
            const response = await api.post(ENDPOINTS.AUTH.LOGOUT);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Refresh access token
     * @returns {Promise<ApiResponse>}
     */
    async refreshToken() {
        try {
            const response = await api.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Change password
     * @param {Object} passwordData - Password change data
     * @returns {Promise<ApiResponse>}
     */
    async changePassword(passwordData) {
        try {
            const response = await api.put(ENDPOINTS.AUTH.PASSWORD, passwordData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

}

export default new AuthService();
