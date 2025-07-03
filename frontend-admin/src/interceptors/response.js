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
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`
            );

            // Backend trả về token mới trong ApiResponse format
            const { data } = response.data; // Lấy data field của ApiResponse
            const newToken = data.token || data.accessToken; // Xử lý cả hai trường hợp
            
            if (newToken) {
                tokenUtils.setTokens(newToken);
                
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
            }
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Use global logout handler instead of direct redirect
            globalLogoutHandler.triggerLogout('token_refresh_failed');
        }
    }

    return Promise.reject(error);
};