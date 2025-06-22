package com.pharmacy.backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContactResponse {
    Long id;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    String content;
    String createdAt;
}
