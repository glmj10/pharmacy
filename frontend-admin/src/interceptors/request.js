import { tokenUtils } from "../utils/token";

export const requestInterceptor = (config) => {
    const accessToken = tokenUtils.getAccessToken();

    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    } else {
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