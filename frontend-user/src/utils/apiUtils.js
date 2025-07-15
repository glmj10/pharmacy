// Utility functions for handling API responses
export const ApiUtils = {
  // Check if response is successful (status 200-299)
  isSuccess: (response) => {
    return response && response.status >= 200 && response.status < 300;
  },

  // Extract data from API response
  extractData: (response) => {
    if (ApiUtils.isSuccess(response)) {
      return response.data;
    }
    return null;
  },

  // Extract error message from response
  extractErrorMessage: (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Đã xảy ra lỗi không xác định';
  },

  // Extract validation errors for form fields
  extractValidationErrors: (error) => {
    const validationErrors = {};
    
    // Check if error has validation details
    if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
      error.response.data.details.forEach(detail => {
        if (detail.field && detail.message) {
          if (!validationErrors[detail.field]) {
            validationErrors[detail.field] = [];
          }
          validationErrors[detail.field].push(detail.message);
        }
      });
    }
    
    return validationErrors;
  },

  // Handle API response and return standardized format
  handleResponse: (response) => {
    if (ApiUtils.isSuccess(response)) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Thành công'
      };
    }
    return {
      success: false,
      data: null,
      message: response.message || 'Có lỗi xảy ra'
    };
  },

  // Get user-friendly error message based on status code
  getUserFriendlyErrorMessage: (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    
    switch (status) {
      case 400:
        return message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập';
      case 401:
        return 'Thông tin đăng nhập không chính xác hoặc phiên làm việc đã hết hạn';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này';
      case 404:
        return 'Không tìm thấy thông tin yêu cầu';
      case 409:
        return message || 'Dữ liệu đã tồn tại trong hệ thống';
      case 422:
        return message || 'Dữ liệu không hợp lệ';
      case 500:
        return 'Lỗi hệ thống. Vui lòng thử lại sau';
      default:
        return message || 'Đã xảy ra lỗi không xác định';
    }
  }
};

export default ApiUtils;
