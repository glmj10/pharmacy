package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRequest {

    @NotNull(message = "Email không được để trống")
    @NotEmpty(message = "Email không được để trống")
    @Email(message = "Sai định dạng email")
    String email;

    @NotEmpty(message = "Tên người dùng không được để trống")
    @NotNull(message = "Tên người dùng không được để trống")
    @Size(min = 3, message = "Tên người dùng phải có ít nhất 3 ký tự")
    String username;

    @NotNull(message = "Mật khẩu không được để trống")
    @NotEmpty(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    String password;

    @NotNull(message = "Mật khẩu xác nhận không được để trống")
    @NotEmpty(message = "Mật khẩu xác nhận không được để trống")
    String confirmPassword;
}
