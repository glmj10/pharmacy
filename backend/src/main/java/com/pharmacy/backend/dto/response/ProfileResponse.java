package com.pharmacy.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
public class ProfileResponse {
    private Long id;
    private String phoneNumber;
    private String fullName;
    private String address;
}
