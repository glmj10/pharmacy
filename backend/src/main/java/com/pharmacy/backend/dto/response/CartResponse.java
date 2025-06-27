package com.pharmacy.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private Long totalPrice;
    private List<CartItemResponse> cartItems;
}
