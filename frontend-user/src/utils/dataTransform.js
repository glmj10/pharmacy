// Data transformation utilities for Profile operations

export const ProfileTransform = {
  // Transform frontend profile form to backend ProfileRequest
  toBackendRequest: (profileData) => {
    return {
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber, // Backend expects 'phone', frontend uses 'phoneNumber'
      address: profileData.address
    };
  },

  // Transform backend ProfileResponse to frontend format
  toFrontendFormat: (backendProfile) => {
    return {
      id: backendProfile.id,
      fullName: backendProfile.fullName,
      phoneNumber: backendProfile.phoneNumber, // Backend returns 'phoneNumber'
      address: backendProfile.address
    };
  },

  // Validate profile form data
  validateProfileForm: (profileData) => {
    const errors = [];

    if (!profileData.fullName || profileData.fullName.trim() === '') {
      errors.push('Họ và tên không được để trống');
    }

    if (!profileData.phoneNumber || profileData.phoneNumber.trim() === '') {
      errors.push('Số điện thoại không được để trống');
    } else if (!/^[0-9+\-\s\(\)]{10,15}$/.test(profileData.phoneNumber.trim())) {
      errors.push('Số điện thoại không hợp lệ');
    }

    if (!profileData.address || profileData.address.trim() === '') {
      errors.push('Địa chỉ không được để trống');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export const UserTransform = {
  // Transform user info for backend (chỉ username, không có email)
  toBackendUserInfo: (userInfo) => {
    return {
      username: userInfo.username
    };
  },

  // Transform password change data
  toBackendPasswordRequest: (passwordData) => {
    return {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    };
  },

  // Validate password form
  validatePasswordForm: (passwordData) => {
    const errors = [];

    if (!passwordData.currentPassword || passwordData.currentPassword.trim() === '') {
      errors.push('Vui lòng nhập mật khẩu hiện tại');
    }

    if (!passwordData.newPassword || passwordData.newPassword.trim() === '') {
      errors.push('Vui lòng nhập mật khẩu mới');
    } else if (passwordData.newPassword.length < 6) {
      errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    if (!passwordData.confirmPassword || passwordData.confirmPassword.trim() === '') {
      errors.push('Vui lòng xác nhận mật khẩu mới');
    }

    if (passwordData.newPassword && passwordData.confirmPassword && 
        passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('Mật khẩu mới không khớp');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Auth data transformation utilities
export const AuthTransform = {
  // Transform login response từ backend
  transformLoginResponse: (apiResponse) => {
    // Backend trả về: ApiResponse<AuthResponse>
    // apiResponse = { status, message, data: { token }, timestamp }
    
    if (!apiResponse || !apiResponse.data) {
      throw new Error('Invalid login response structure');
    }

    return {
      token: apiResponse.data.token,
      message: apiResponse.message,
      status: apiResponse.status
    };
  },

  // Transform register response từ backend
  transformRegisterResponse: (apiResponse) => {
    // Backend trả về: ApiResponse<UserResponse>
    // apiResponse = { status, message, data: UserResponse, timestamp }
    
    if (!apiResponse || !apiResponse.data) {
      throw new Error('Invalid register response structure');
    }

    return {
      user: {
        id: apiResponse.data.id,
        username: apiResponse.data.username,
        email: apiResponse.data.email,
        profilePic: apiResponse.data.profilePic,
        roles: apiResponse.data.roles,
        createdAt: apiResponse.data.createdAt
      },
      message: apiResponse.message,
      status: apiResponse.status
    };
  },

  // Transform user info từ backend UserResponse
  transformUserResponse: (userResponse) => {
    if (!userResponse) {
      return null;
    }

    return {
      id: userResponse.id,
      username: userResponse.username,
      email: userResponse.email,
      profilePic: userResponse.profilePic,
      roles: userResponse.roles || [],
      createdAt: userResponse.createdAt
    };
  },

  // Validate login credentials
  validateLoginCredentials: (credentials) => {
    const errors = [];

    if (!credentials.email || credentials.email.trim() === '') {
      errors.push('Email không được để trống');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.push('Email không hợp lệ');
    }

    if (!credentials.password || credentials.password.trim() === '') {
      errors.push('Mật khẩu không được để trống');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate register data
  validateRegisterData: (userData) => {
    const errors = [];

    if (!userData.email || userData.email.trim() === '') {
      errors.push('Email không được để trống');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Email không hợp lệ');
    }

    if (!userData.username || userData.username.trim() === '') {
      errors.push('Tên người dùng không được để trống');
    } else if (userData.username.length < 3) {
      errors.push('Tên người dùng phải có ít nhất 3 ký tự');
    }

    if (!userData.password || userData.password.trim() === '') {
      errors.push('Mật khẩu không được để trống');
    } else if (userData.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (!userData.confirmPassword || userData.confirmPassword.trim() === '') {
      errors.push('Mật khẩu xác nhận không được để trống');
    } else if (userData.password !== userData.confirmPassword) {
      errors.push('Mật khẩu xác nhận không khớp');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Transform change password request
  toChangePasswordRequest: (passwordData) => {
    return {
      oldPassword: passwordData.currentPassword,
      password: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    };
  },

  // Transform user info request (for updating profile)
  toUserInfoRequest: (userInfo) => {
    return {
      email: userInfo.email,
      username: userInfo.username
    };
  }
};

// Error handling utilities
export const ErrorTransform = {
  // Transform backend validation errors to frontend format
  transformValidationErrors: (error) => {
    const fieldErrors = {};
    
    // Check if error has validation details from backend
    if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
      error.response.data.details.forEach(detail => {
        if (detail.field && detail.message) {
          if (!fieldErrors[detail.field]) {
            fieldErrors[detail.field] = [];
          }
          fieldErrors[detail.field].push(detail.message);
        }
      });
    }
    
    return fieldErrors;
  },

  // Get first error message for a field
  getFirstFieldError: (fieldErrors, fieldName) => {
    return fieldErrors[fieldName] && fieldErrors[fieldName].length > 0 
      ? fieldErrors[fieldName][0] 
      : null;
  },

  // Check if field has validation error
  hasFieldError: (fieldErrors, fieldName) => {
    return fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  },

  // Transform error response to user-friendly message
  transformErrorMessage: (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    
    // Priority: specific field errors > general message > status-based message
    const fieldErrors = ErrorTransform.transformValidationErrors(error);
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    
    if (hasFieldErrors) {
      return 'Vui lòng kiểm tra lại thông tin đã nhập';
    }
    
    if (message) {
      return message;
    }
    
    switch (status) {
      case 400:
        return 'Dữ liệu không hợp lệ';
      case 401:
        return 'Thông tin đăng nhập không chính xác';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này';
      case 404:
        return 'Không tìm thấy thông tin yêu cầu';
      case 409:
        return 'Dữ liệu đã tồn tại trong hệ thống';
      case 422:
        return 'Dữ liệu không hợp lệ';
      case 500:
        return 'Lỗi hệ thống. Vui lòng thử lại sau';
      default:
        return 'Đã xảy ra lỗi không xác định';
    }
  }
};

export default { ProfileTransform, UserTransform, AuthTransform, ErrorTransform };
