package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.ProfileRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ProfileResponse;

import java.util.List;

public interface ProfileService {
    ApiResponse<List<ProfileResponse>> getUserProfiles();
    ApiResponse<ProfileResponse> createProfile(ProfileRequest request);
    ApiResponse<ProfileResponse> updateProfile(Long id, ProfileRequest request);
    ApiResponse<Void> deleteProfile(Long id);
    ApiResponse<ProfileResponse> getProfileById(Long id);
}
