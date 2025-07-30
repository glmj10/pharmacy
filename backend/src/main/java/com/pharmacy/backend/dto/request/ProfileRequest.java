package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileRequest {

    @NotEmpty(message = "Tên người nhận không được để trống")
    String fullName;

    @NotEmpty(message = "Số điện thoại không được để trống")
    String phoneNumber;

    @NotEmpty(message = "Địa chỉ không được để trống")
    String address;

}
