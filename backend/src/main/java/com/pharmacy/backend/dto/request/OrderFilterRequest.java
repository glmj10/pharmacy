package com.pharmacy.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderFilterRequest {
    private Long id;
    private String orderStatus;
    private String paymentStatus;
    private String customerPhoneNumber;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
}
