package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.ProfileRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ProfileResponse;
import com.pharmacy.backend.entity.Profile;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.ProfileMapper;
import com.pharmacy.backend.repository.ProfileRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.ProfileService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {
    ProfileRepository profileRepository;
    ProfileMapper profileMapper;
    UserRepository userRepository;

    @Override
    public ApiResponse<List<ProfileResponse>> getUserProfiles() {
        List<Profile> profiles = profileRepository.findByUser_Id(SecurityUtils.getCurrentUserId());
        List<ProfileResponse> responses = profiles.stream().map(
            profileMapper::toProfileResponse
        ).toList();

        return ApiResponse.<List<ProfileResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin địa chỉ thành công")
                .data(responses)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<ProfileResponse> createProfile(ProfileRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(Objects.requireNonNull(currentUserId))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "User not found"));

        Profile profile = profileMapper.toProfile(request);
        profile.setUser(user);
        profile = profileRepository.save(profile);
        ProfileResponse response = profileMapper.toProfileResponse(profile);
        return ApiResponse.<ProfileResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Thêm mới địa chỉ thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<ProfileResponse> updateProfile(Long id, ProfileRequest request) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại", "Profile not found"));

        if (!profile.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền sửa địa chỉ này", "Forbidden");
        }

        Profile updatedProfile = profileMapper.updateProfileFromRequest(request, profile);
        profile = profileRepository.save(updatedProfile);
        ProfileResponse response = profileMapper.toProfileResponse(profile);

        return ApiResponse.<ProfileResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật địa chỉ thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<Void> deleteProfile(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại", "Profile not found"));

        if (!profile.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa địa chỉ này", "Forbidden");
        }

        profileRepository.delete(profile);

        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Xóa địa chỉ thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<ProfileResponse> getProfileById(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại", "Profile not found"));

        if (!profile.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem địa chỉ này", "Forbidden");
        }

        ProfileResponse response = profileMapper.toProfileResponse(profile);

        return ApiResponse.<ProfileResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin địa chỉ thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
