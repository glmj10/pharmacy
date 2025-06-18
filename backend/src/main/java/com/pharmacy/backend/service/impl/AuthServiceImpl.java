package com.pharmacy.backend.service.impl;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy.backend.dto.request.AuthRequest;
import com.pharmacy.backend.dto.request.ChangePasswordRequest;
import com.pharmacy.backend.dto.request.UserInfoRequest;
import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.AuthResponse;
import com.pharmacy.backend.dto.response.RefreshRequest;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.InvalidatedToken;
import com.pharmacy.backend.entity.Role;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.enums.RoleCodeEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.UserMapper;
import com.pharmacy.backend.repository.InvalidatedTokenRepository;
import com.pharmacy.backend.repository.RoleRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.security.JwtUtils;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
public class AuthServiceImpl implements AuthService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    JwtUtils jwtUtils;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @Transactional
    @Override
    public ApiResponse<AuthResponse> login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Tài khoản hoặc mật khẩu không chính xác", "email"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tài khoản hoặc mật khẩu không chính xác", "password");
        }

        List<RoleCodeEnum> roles = user.getRoles().stream()
                .map(Role::getCode)
                .toList();
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getEmail(), roles);
        AuthResponse authResponse = new AuthResponse(token);

        return ApiResponse.<AuthResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Đăng nhập thành công")
                .data(authResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<UserResponse> register(UserRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email đã tồn tại", "email");
        }

        if(!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp", "confirmPassword");
        }

        request.setPassword(passwordEncoder.encode(request.getPassword()));

        User user = userMapper.toUser(request);
        Role role = roleRepository.findByCode(RoleCodeEnum.USER)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy quyền", "role"));

        user.getRoles().add(role);

        User savedUser = userRepository.save(user);

        UserResponse userResponse = userMapper.toUserResponse(savedUser);
        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Đăng ký thành công")
                .data(userResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<UserResponse> changeInfo(UserInfoRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "email"));
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        UserResponse userResponse = userMapper.toUserResponse(userRepository.save(user));
        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật thông tin thành công")
                .data(userResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<String> logout(String bearerToken) throws ParseException {
        if(bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Token không hợp lệ", "token");
        }
        String token = bearerToken.substring(7);

        SignedJWT jwt = SignedJWT.parse(token);
        InvalidatedToken invalidatedToken = new InvalidatedToken(
                jwt.getJWTClaimsSet().getJWTID(),
                jwt.getJWTClaimsSet().getExpirationTime()
        );

        invalidatedTokenRepository.save(invalidatedToken);
        return ApiResponse.<String>builder()
                .status(HttpStatus.OK.value())
                .message("Đăng xuất thành công")
                .data("Token đã được vô hiệu hóa")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<AuthResponse> refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = jwtUtils.verifyToken(request.getToken(), true);
        long userId = (long) signedJWT.getJWTClaimsSet().getClaim("id");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "user"));

        InvalidatedToken invalidatedToken = new InvalidatedToken(signedJWT.getJWTClaimsSet().getJWTID(),
                signedJWT.getJWTClaimsSet().getExpirationTime());
        invalidatedTokenRepository.save(invalidatedToken);

        List<RoleCodeEnum> roles = user.getRoles().stream()
                .map(Role::getCode)
                .toList();

        String newToken = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getEmail(), roles);
        AuthResponse authResponse = new AuthResponse(newToken);
        return ApiResponse.<AuthResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Làm mới token thành công")
                .data(authResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<String> changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "email"));
        if(!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác", "oldPassword");
        }
        String newPassword = request.getPassword();
        if(!newPassword.equals(request.getConfirmPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp", "confirmPassword");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return ApiResponse.<String>builder()
                .status(HttpStatus.OK.value())
                .message("Đổi mật khẩu thành công")
                .data("Mật khẩu đã được cập nhật")
                .timestamp(LocalDateTime.now())
                .build();
    }
}

