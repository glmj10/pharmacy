import { tokenUtils } from "../utils/token";

export const requestInterceptor = (config) => {
    const accessToken = tokenUtils.getAccessToken();

    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Don't set Content-Type for FormData - let browser handle it with boundary
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    } else {
        // For FormData, remove any existing Content-Type to let browser set it
        delete config.headers['Content-Type'];
    }

    config.params = {
        ...config.params,
        timestamp: Date.now() 
    };

    return config;
}

export const requestErrorInterceptor = (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
}