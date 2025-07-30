export const ApiUtils = {
  isSuccess: (response) => {
    return response && response.status >= 200 && response.status < 300;
  },

  extractData: (response) => {
    if (ApiUtils.isSuccess(response)) {
      return response.data;
    }
    return null;
  },

  extractErrorMessage: (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Đã xảy ra lỗi không xác định';
  },

  extractValidationErrors: (error) => {
    const validationErrors = {};
    
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
