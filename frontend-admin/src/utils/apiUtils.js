import { ApiResponse, ErrorResponse, ValidationError } from './apiTypes';

/**
 * API Response utility functions
 */
export const apiUtils = {
    /**
     * Create success response
     * @param {*} data 
     * @param {string} message 
     * @param {number} status 
     * @returns {ApiResponse}
     */
    createSuccessResponse(data, message = 'Success', status = 200) {
        return new ApiResponse(status, message, data);
    },

    /**
     * Create error response
     * @param {string} error 
     * @param {string} message 
     * @param {number} status 
     * @param {ValidationError[]} details 
     * @param {string} path 
     * @returns {ErrorResponse}
     */
    createErrorResponse(error, message, status = 500, details = [], path = '') {
        return new ErrorResponse(status, error, message, details, path);
    },

    /**
     * Check if response is successful
     * @param {any} response 
     * @returns {boolean}
     */
    isSuccessResponse(response) {
        return response && response.status >= 200 && response.status < 300;
    },

    /**
     * Extract data from API response
     * @param {ApiResponse} response 
     * @returns {*}
     */
    extractData(response) {
        if (this.isSuccessResponse(response)) {
            return response.data;
        }
        return null;
    },

    /**
     * Extract error message from response
     * @param {ErrorResponse} error 
     * @returns {string}
     */
    extractErrorMessage(error) {
        if (error instanceof ErrorResponse) {
            return error.getFullErrorMessage();
        }
        return error?.message || 'An unexpected error occurred';
    },

    /**
     * Handle form validation errors
     * @param {ErrorResponse} error 
     * @returns {Object} - Object with field names as keys and error messages as values
     */
    extractValidationErrors(error) {
        const validationErrors = {};
        
        if (error instanceof ErrorResponse && error.details) {
            error.details.forEach(detail => {
                if (!validationErrors[detail.field]) {
                    validationErrors[detail.field] = [];
                }
                validationErrors[detail.field].push(detail.message);
            });
        }
        
        return validationErrors;
    },

    /**
     * Convert axios response to ApiResponse
     * @param {AxiosResponse} axiosResponse 
     * @returns {ApiResponse}
     */
    fromAxiosResponse(axiosResponse) {
        const { status, message, data, timestamp } = axiosResponse.data;
        return new ApiResponse(status, message, data, timestamp);
    },

    /**
     * Convert axios error to ErrorResponse
     * @param {AxiosError} axiosError 
     * @returns {ErrorResponse}
     */
    fromAxiosError(axiosError) {
        // Log the error for debugging
        console.error('API Error:', {
            message: axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            config: {
                url: axiosError.config?.url,
                method: axiosError.config?.method,
                baseURL: axiosError.config?.baseURL
            }
        });

        if (axiosError.response?.data) {
            const errorData = axiosError.response.data;
            const details = errorData.details ? 
                errorData.details.map(d => new ValidationError(d.field, d.message)) : 
                [];
            
            return new ErrorResponse(
                errorData.status || axiosError.response.status,
                errorData.error || 'API Error',
                errorData.message || 'Đã xảy ra lỗi',
                details,
                errorData.path || '',
                errorData.timestamp
            );
        }
        
        // Handle network errors
        if (axiosError.code === 'NETWORK_ERROR' || axiosError.message.includes('Network Error')) {
            return new ErrorResponse(
                0,
                'Network Error',
                'Không thể kết nối đến máy chủ'
            );
        }
        
        return new ErrorResponse(
            500,
            'Unknown Error',
            axiosError.message || 'Đã xảy ra lỗi không xác định'
        );
    },

    /**
     * Show user-friendly error message
     * @param {ErrorResponse} error 
     * @returns {string}
     */
    getUserFriendlyErrorMessage(error) {
        if (error instanceof ErrorResponse) {
            // Handle specific error types
            switch (error.status) {
                case 400:
                    return error.details?.length > 0 ? 
                        'Vui lòng kiểm tra lại thông tin đã nhập' : 
                        error.message || 'Dữ liệu không hợp lệ';
                case 401:
                    return 'Thông tin đăng nhập không chính xác hoặc phiên làm việc đã hết hạn';
                case 403:
                    return 'Bạn không có quyền thực hiện thao tác này';
                case 404:
                    return 'Không tìm thấy thông tin yêu cầu';
                case 409:
                    return error.message || 'Dữ liệu đã tồn tại trong hệ thống';
                case 422:
                    return error.message || 'Dữ liệu không hợp lệ';
                case 500:
                    return 'Lỗi hệ thống. Vui lòng thử lại sau';
                case 502:
                case 503:
                case 504:
                    return 'Hệ thống đang bảo trì. Vui lòng thử lại sau';
                default:
                    return error.message || 'Đã xảy ra lỗi không xác định';
            }
        }
        
        // Handle network errors or other errors
        if (error && typeof error === 'object') {
            if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
            }
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                return 'Kết nối quá chậm. Vui lòng thử lại';
            }
            return error.message || 'Đã xảy ra lỗi không xác định';
        }
        
        return 'Đã xảy ra lỗi không xác định';
    }
};
