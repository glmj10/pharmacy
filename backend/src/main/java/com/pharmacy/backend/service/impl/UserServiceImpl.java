package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.RoleRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.FileMetadata;
import com.pharmacy.backend.entity.Role;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.enums.RoleCodeEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.UserMapper;
import com.pharmacy.backend.repository.FileMetadataRepository;
import com.pharmacy.backend.repository.RoleRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.UserService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    RoleRepository roleRepository;
    UserRepository userRepository;
    UserMapper userMapper;
    FileMetadataRepository fileMetadataRepository;


    @Transactional
    @Override
    public ApiResponse<PageResponse<List<UserResponse>>> getAllUsers(Integer pageIndex, Integer pageSize, String email) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<User> userPage;
        if(email != null && !email.isEmpty()) {
            userPage = userRepository.findAllByEmailContainingIgnoreCase(email, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(user -> {
                    UserResponse userResponse = userMapper.toUserResponse(user);
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(user.getProfilePic()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                    "Ảnh đại diện không tồn tại", user.getProfilePic()));
                    userResponse.setProfilePic(fileMetadata.getUrl());
                    return userResponse;
                })
                .toList();

        PageResponse<List<UserResponse>> pageResponse = PageResponse.<List<UserResponse>>builder()
                .currentPage(userPage.getNumber() + 1)
                .totalPages(userPage.getTotalPages())
                .totalElements(userPage.getTotalElements())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .content(userResponses)
                .build();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách người dùng thành công",
                pageResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<UserResponse> getCurrentUser() {
        User currentUser = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", SecurityUtils.getCurrentUserId()));
        UserResponse userResponse = userMapper.toUserResponse(currentUser);
        userResponse.setRoles(null);
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(currentUser.getProfilePic()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ảnh đại diện không tồn tại", currentUser.getProfilePic()));
        userResponse.setProfilePic(fileMetadata.getUrl());
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy thông tin người dùng hiện tại thành công",
                userResponse
        );
    }

    @Override
    public ApiResponse<Long> getTotalUser() {
        Long totalUsers = userRepository.count();
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy tổng số người dùng thành công",
                totalUsers
        );
    }


    @Transactional
    @Override
    public ApiResponse<UserResponse> changeUserRole(Long userId, RoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Nguời dùng không tồn tại", userId));
        List<RoleCodeEnum> currentRoles = user.getRoles().stream()
                .map(Role::getCode)
                .toList();
        if(currentRoles.contains(RoleCodeEnum.ADMIN)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền thay đổi quyền của người dùng ADMIN", null);
        }
        if (request.getRoleCodes() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Danh sách quyền không được để trống", null);
        }

        Set<RoleCodeEnum> codes = request.getRoleCodes().stream()
                .map(roles -> RoleCodeEnum.valueOf(roles.toUpperCase())).collect(Collectors.toSet());
        if (codes.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ít nhất một quyền", userId);
        }

        Set<Role> roles = roleRepository.findAllByCodeIn(codes)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Quyền không tồn tại", codes));

        user.setRoles(roles);
        user.setTokenVersion(user.getTokenVersion() + 1);
        User savedUser = userRepository.save(user);
        UserResponse userResponse = userMapper.toUserResponse(savedUser);

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Cập nhật quyền người dùng thành công",
                userResponse
        );
    }


    @Transactional
    @Override
    public ApiResponse<UserResponse> getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", userId));

        UserResponse userResponse = userMapper.toUserResponse(user);


        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy thông tin người dùng thành công",
                userResponse
        );
    }

}
