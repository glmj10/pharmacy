package com.pharmacy.backend.dto.request;

import lombok.Data;

@Data
public class ContactRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String content;
}
