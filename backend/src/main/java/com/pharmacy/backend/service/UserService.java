package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.RoleRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    ApiResponse<UserResponse> changeUserRole(Long userId, RoleRequest request);
    ApiResponse<UserResponse> getUserById(Long userId);
    ApiResponse<PageResponse<List<UserResponse>>> getAllUsers(Integer pageIndex, Integer pageSize, String email);
    ApiResponse<UserResponse> getCurrentUser();
}
