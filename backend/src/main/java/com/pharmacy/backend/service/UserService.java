package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.UserResponse;

public interface UserService {
    ApiResponse<UserResponse> changeUserRole(Long userId, String roleCode);
}
