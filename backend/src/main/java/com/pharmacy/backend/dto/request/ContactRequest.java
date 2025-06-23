package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ContactRequest {
    @NotEmpty(message = "Họ và tên không được để trống")
    private String fullName;
    @NotEmpty(message = "Email không được để trống")
    private String email;
    @NotEmpty(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    private String address;
    @NotEmpty(message = "Nội dung không được để trống")
    private String content;
}
