import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';
import { tokenUtils } from '../utils/token';

class AuthService {
    async register(userData) {
        try {
            const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async login(credentials) {
        try {
            const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updateInfo(profileData) {
        try {
            const response = await api.put(ENDPOINTS.AUTH.INFO, profileData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async logout() {
        try {
            const response = await api.post(ENDPOINTS.AUTH.LOGOUT);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async refreshToken(currentToken = null) {
        try {
            // If no token provided, get from storage
            const token = currentToken || tokenUtils.getAccessToken();
            if (!token) {
                throw new Error('No token available for refresh');
            }

            const response = await api.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
                token: token
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async changePassword(passwordData) {
        try {
            const response = await api.put(ENDPOINTS.AUTH.PASSWORD, passwordData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async forgotPassword(confirmationData) {
        try {
            const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, confirmationData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async resetPassword(resetData) {
        try {
            const { password, confirmPassword, token } = resetData;
            const response = await api.put(ENDPOINTS.AUTH.RESET_PASSWORD, {
                resetToken: token,
                password,
                confirmPassword
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

}

export default new AuthService();
