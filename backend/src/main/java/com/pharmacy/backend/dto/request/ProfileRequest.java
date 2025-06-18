package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileRequest {

    @NotNull(message = "Tên người nhận không được để trống")
    @NotEmpty(message = "Tên người nhận không được để trống")
    String fullName;

    @NotNull(message = "Số điện thoại không được để trống")
    @NotEmpty(message = "Số điện thoại không được để trống")
    String phone;

    @NotNull(message = "Địa chỉ không được để trống")
    @NotEmpty(message = "Địa chỉ không được để trống")
    String address;

}
