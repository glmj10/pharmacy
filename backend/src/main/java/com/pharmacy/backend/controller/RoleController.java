package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.RoleResponse;
import com.pharmacy.backend.service.impl.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/roles")
public class RoleController {
    private final RoleService roleService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        ApiResponse<List<RoleResponse>> response = roleService.getAllRoles();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
