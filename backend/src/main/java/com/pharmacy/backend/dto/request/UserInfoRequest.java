package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInfoRequest {
    @Email(message = "Sai định dạng email")
    @NotEmpty(message = "Email không được để trống")
    @NotNull(message = "Email không được để trống")
    String email;

    @NotEmpty(message = "Tên người dùng không được để trống")
    @NotNull(message = "Tên người dùng không được để trống")
    String username;
}
