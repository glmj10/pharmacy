import axios from 'axios';
import { tokenUtils } from '../utils/token';
import { globalLogoutHandler } from '../utils/globalLogout';
import { API_CONFIG, ENDPOINTS } from '../config/constants';

export const responseInterceptor = (response) => {
    return response;
};

export const responseErrorInterceptor = async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            // Get current token for refresh
            const currentToken = tokenUtils.getAccessToken();
            if (!currentToken) {
                console.warn('No token available for refresh, redirecting to login');
                globalLogoutHandler.triggerLogout('session_expired');
                return Promise.reject(error);
            }

            console.log('Attempting token refresh...');

            // Send refresh token request with current token in body
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                {
                    token: currentToken
                }
            );

            // Backend trả về token mới trong ApiResponse format
            const { data } = response.data; // Lấy data field của ApiResponse
            const newToken = data.token; // Backend trả về field "token" trong AuthResponse
            
            if (newToken) {
                console.log('Token refresh successful');
                tokenUtils.setTokens(newToken);
                
                // Retry original request với token mới
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
            } else {
                throw new Error('No token received from refresh endpoint');
            }
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            console.error('Refresh error details:', {
                status: refreshError.response?.status,
                message: refreshError.response?.data?.message,
                data: refreshError.response?.data
            });
            
            // Determine reason based on refresh error response from backend
            let reason = 'token_refresh_failed';
            
            if (refreshError.response?.status === 401) {
                const errorMessage = refreshError.response?.data?.message || '';
                if (errorMessage.includes('hết hạn')) {
                    reason = 'session_expired';
                } else if (errorMessage.includes('vô hiệu hóa')) {
                    reason = 'token_invalidated';
                } else if (errorMessage.includes('không hợp lệ')) {
                    reason = 'unauthorized';
                } else {
                    reason = 'session_expired';
                }
            } else if (refreshError.response?.status === 404) {
                reason = 'unauthorized'; // User not found
            }
            
            // Use global logout handler with appropriate reason
            globalLogoutHandler.triggerLogout(reason);
        }
    }

    // Handle other 401 errors that are not token refresh related
    if (error.response?.status === 401 && originalRequest._retry) {
        globalLogoutHandler.triggerLogout('session_expired');
    }

    return Promise.reject(error);
};