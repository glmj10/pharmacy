package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotNull(message = "Mật khẩu cũ không được để trống")
    @NotEmpty(message = "Mật khẩu cũ không được để trống")
    private String oldPassword;

    @NotNull(message = "Mật khẩu mới không được để trống")
    @NotEmpty(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu mới phải có độ dài từ 6 ký tự")
    private String password;

    @NotNull(message = "Mật khẩu xác nhận không được để trống")
    private String confirmPassword;
}
