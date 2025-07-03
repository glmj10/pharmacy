import { tokenUtils } from "../utils/token";

export const requestInterceptor = (config) => {
    const accessToken = tokenUtils.getAccessToken();

    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
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