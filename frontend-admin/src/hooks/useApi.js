import { useState, useCallback } from 'react';
import { apiUtils } from '../utils/apiUtils';

/**
 * Custom hook for handling API calls with loading states and error handling
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - Object containing data, loading, error states and execute function
 */
export const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFunction(...args);
            if (response.isSuccess()) {
                setData(response.getData());
                return response;
            } else {
                const errorMsg = apiUtils.getUserFriendlyErrorMessage(response);
                setError(errorMsg);
                throw response;
            }
        } catch (err) {
            const errorMsg = apiUtils.getUserFriendlyErrorMessage(err);
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        execute,
        reset
    };
};

/**
 * Custom hook for handling authentication state
 * @returns {Object} - Auth state and functions
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    const login = useCallback(async (credentials, authService) => {
        setLoading(true);
        try {
            const response = await authService.login(credentials);
            if (response.isSuccess()) {
                const { token, user: userData } = response.getData();
                
                // Store token
                if (token) {
                    localStorage.setItem('accessToken', token);
                }
                
                // Set user state
                setUser(userData);
                setIsAuthenticated(true);
                
                return response;
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async (authService) => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    }, []);

    const checkAuth = useCallback(async (authService) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        setLoading(true);
        try {
            const response = await authService.getUserInfo();
            if (response.isSuccess()) {
                setUser(response.getData());
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('accessToken');
            }
        } catch (error) {
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
    };
};

/**
 * Custom hook for handling form validation with API error responses
 * @param {Object} initialValues - Initial form values
 * @returns {Object} - Form state and handlers
 */
export const useApiForm = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const setFieldTouched = useCallback((name, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValue(name, value);
    }, [setValue]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setFieldTouched(name, true);
    }, [setFieldTouched]);

    const setApiErrors = useCallback((apiError) => {
        const validationErrors = apiUtils.extractValidationErrors(apiError);
        setErrors(validationErrors);
    }, []);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const isFieldInvalid = useCallback((fieldName) => {
        return touched[fieldName] && !!errors[fieldName];
    }, [touched, errors]);

    return {
        values,
        errors,
        touched,
        setValue,
        handleChange,
        handleBlur,
        setApiErrors,
        reset,
        isFieldInvalid
    };
};
