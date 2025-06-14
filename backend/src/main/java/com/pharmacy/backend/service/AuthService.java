package com.pharmacy.backend.service;

import com.nimbusds.jose.JOSEException;
import com.pharmacy.backend.dto.request.AuthRequest;
import com.pharmacy.backend.dto.request.UserInfoRequest;
import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.AuthResponse;
import com.pharmacy.backend.dto.response.RefreshRequest;
import com.pharmacy.backend.dto.response.UserResponse;

import java.text.ParseException;

public interface AuthService {
    ApiResponse<AuthResponse> login(AuthRequest request);
    ApiResponse<UserResponse> register(UserRequest request);
    ApiResponse<UserResponse> changeInfo(UserInfoRequest request);
    ApiResponse<String> logout(String token) throws ParseException;
    ApiResponse<AuthResponse> refreshToken(RefreshRequest request) throws ParseException, JOSEException;
}
