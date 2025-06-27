package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.CartItemRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.CartItemResponse;

import com.pharmacy.backend.dto.response.CartResponse;
import com.pharmacy.backend.entity.User;

import java.util.List;

public interface CartService {
    void createCart(User user);
    ApiResponse<CartResponse> getCart();
    ApiResponse<CartItemResponse> addItemToCart(CartItemRequest request);
    ApiResponse<CartItemResponse> updateItemQuantity(Long itemId, Long quantity);
    ApiResponse<Void> removeItemFromCart(Long itemId);
    ApiResponse<Void> clearCart();
    ApiResponse<CartItemResponse> changeItemSelection(Long itemId, Boolean status);
    ApiResponse<List<CartItemResponse>> selectAllItems(Boolean status);
}
