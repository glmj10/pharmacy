package com.pharmacy.backend.controller;


import com.pharmacy.backend.dto.request.RoleRequest;
import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/users")
public class UserController {
    UserService userService;

    @PutMapping("/role/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long userId,
            @RequestBody @Valid RoleRequest request) {
        ApiResponse<UserResponse> response = userService.changeUserRole(userId, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long userId) {
        ApiResponse<UserResponse> response = userService.getUserById(userId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


}
