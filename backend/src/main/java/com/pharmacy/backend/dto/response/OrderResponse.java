package com.pharmacy.backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long id;
    Long totalPrice;
    String note;
    String customerName;
    String customerPhoneNumber;
    String customerAddress;
    String status;
    String paymentMethod;
    String paymentStatus;
    LocalDateTime createdAt;
}
