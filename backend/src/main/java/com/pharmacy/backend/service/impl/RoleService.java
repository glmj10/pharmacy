package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.RoleResponse;
import com.pharmacy.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    public ApiResponse<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = roleRepository.findAll().stream()
                .map(role -> RoleResponse.builder()
                        .id(role.getId())
                        .name(role.getName())
                        .code(role.getCode().toString())
                        .build())
                .toList();

        return ApiResponse.<List<RoleResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách vai trò thành công")
                .data(roles)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
