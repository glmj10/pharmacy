package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ProductResponse;

import java.util.List;

public interface WishlistService {
    ApiResponse<List<ProductResponse>> getMyWishlist();
    ApiResponse<Void> addProductToWishlist(Long productId);
    ApiResponse<Void> removeProductFromWishlist(Long wishlistId);
    ApiResponse<Void> clearWishlist();
}
