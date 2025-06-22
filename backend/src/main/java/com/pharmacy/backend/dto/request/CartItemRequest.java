package com.pharmacy.backend.dto.request;

import lombok.Data;

@Data
public class CartItemRequest {
    private Long productId;
    private Long quantity;
}
