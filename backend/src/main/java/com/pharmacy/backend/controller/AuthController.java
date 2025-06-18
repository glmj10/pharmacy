package com.pharmacy.backend.controller;

import com.nimbusds.jose.JOSEException;
import com.pharmacy.backend.dto.request.AuthRequest;
import com.pharmacy.backend.dto.request.ChangePasswordRequest;
import com.pharmacy.backend.dto.request.UserInfoRequest;
import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.AuthResponse;
import com.pharmacy.backend.dto.response.RefreshRequest;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;


@Controller
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody @Valid UserRequest userRequest) {
        ApiResponse<UserResponse> response = authService.register(userRequest);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody @Valid AuthRequest request) {
        ApiResponse<AuthResponse> response = authService.login(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/info")
    public ResponseEntity<ApiResponse<UserResponse>> changeInfo(@RequestBody @Valid UserInfoRequest request) {
        ApiResponse<UserResponse> response = authService.changeInfo(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestHeader("Authorization") String bearerToken) throws ParseException {
        ApiResponse<String> response = authService.logout(bearerToken);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody @Valid RefreshRequest request) throws ParseException, JOSEException {
        ApiResponse<AuthResponse> response = authService.refreshToken(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        ApiResponse<String> response = authService.changePassword(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
