import { storage, TOKEN_KEYS } from './storage';

export const tokenUtils = {
    getAccessToken: () => {
        return storage.get(TOKEN_KEYS.ACCESS_TOKEN);
    },

    setAccessToken: (token) => {
        storage.set(TOKEN_KEYS.ACCESS_TOKEN, token);
    },

    setTokens: (accessToken, refreshToken = null) => {
        if (accessToken) {
            storage.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        }
        if (refreshToken) {
            storage.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
        }
    },

    removeTokens: () => {
        storage.remove(TOKEN_KEYS.ACCESS_TOKEN);
        storage.remove(TOKEN_KEYS.REFRESH_TOKEN);
    },

    isTokenExpired: (token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    },

    decodeToken: (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch {
            return null;
        }
    },

    getUserAuthorities: (token) => {
        const decoded = tokenUtils.decodeToken(token);
        return decoded ? decoded.authorities : null;
    },

    hasAnyRole: (roleList = []) => {
        const token = tokenUtils.getAccessToken();
        const roles = tokenUtils.getUserAuthorities(token);
        return roles ? roleList.some((role) => roles.includes(role)) : false;
    }

}
