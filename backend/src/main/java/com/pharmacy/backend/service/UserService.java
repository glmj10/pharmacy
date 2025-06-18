package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.RoleRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.User;

public interface UserService {
    ApiResponse<UserResponse> changeUserRole(Long userId, RoleRequest request);
    ApiResponse<UserResponse> getUserById(Long userId);
}
