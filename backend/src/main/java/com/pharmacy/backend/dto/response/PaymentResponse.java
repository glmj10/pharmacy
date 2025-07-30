package com.pharmacy.backend.dto.response;

import lombok.Data;

@Data
public class PaymentResponse {
    private String ipnUrl;
    private String paymentUrl;
}
