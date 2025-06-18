package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.ProfileRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ProfileResponse;
import com.pharmacy.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>>  getUserProfiles() {
        ApiResponse<List<ProfileResponse>> response = profileService.getUserProfiles();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfileById(@PathVariable Long id) {
        ApiResponse<ProfileResponse> response = profileService.getProfileById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(@RequestBody ProfileRequest request) {
        ApiResponse<ProfileResponse> response = profileService.createProfile(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(@PathVariable Long id, @RequestBody ProfileRequest request) {
        ApiResponse<ProfileResponse> response = profileService.updateProfile(id, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@PathVariable Long id) {
        ApiResponse<Void> response = profileService.deleteProfile(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
