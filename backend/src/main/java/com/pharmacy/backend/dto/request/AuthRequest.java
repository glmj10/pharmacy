package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthRequest {
    @NotNull(message = "Email không được để trống")
    @NotEmpty(message = "Email không được để trống")
    String email;

    @NotNull(message = "Mật khẩu không được để trống")
    @NotEmpty(message = "Mật khẩu không được để trống")
    String password;
}
