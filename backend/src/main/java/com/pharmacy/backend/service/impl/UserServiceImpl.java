package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.RoleRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.Role;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.enums.RoleCodeEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.UserMapper;
import com.pharmacy.backend.repository.RoleRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.service.UserService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    RoleRepository roleRepository;
    UserRepository userRepository;
    UserMapper userMapper;


    @Transactional
    @Override
    public ApiResponse<PageResponse<List<UserResponse>>> getAllUsers(Integer pageIndex, Integer pageSize, String email) {
        if(pageIndex < 0 || pageSize <= 0) {
            pageIndex = 0;
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
                .map(userMapper::toUserResponse)
                .toList();

        PageResponse<List<UserResponse>> pageResponse = PageResponse.<List<UserResponse>>builder()
                .currentPage(userPage.getNumber() + 1)
                .totalPages(userPage.getTotalPages())
                .totalElements(userPage.getTotalElements())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .content(userResponses)
                .build();

        return ApiResponse.<PageResponse<List<UserResponse>>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách người dùng thành công")
                .data(pageResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<UserResponse> changeUserRole(Long userId, RoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Nguời dùng không tồn tại", userId));
        Set<RoleCodeEnum> codes = request.getRoleCodes().stream()
                .map(roles -> RoleCodeEnum.valueOf(roles.toUpperCase())).collect(Collectors.toSet());
        if (codes.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ít nhất một quyền", userId);
        }

        Set<Role> roles = roleRepository.findAllByCodeIn(codes)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Quyền không tồn tại", codes));

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        UserResponse userResponse = userMapper.toUserResponse(savedUser);

        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật quyền người dùng thành công")
                .data(userResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }


    @Transactional
    @Override
    public ApiResponse<UserResponse> getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", userId));

        UserResponse userResponse = userMapper.toUserResponse(user);

        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin người dùng thành công")
                .data(userResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

}
