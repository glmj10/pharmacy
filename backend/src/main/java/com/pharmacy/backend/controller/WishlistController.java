package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ProductResponse;
import com.pharmacy.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/wishlist")
@PreAuthorize( "hasRole('USER')")
public class WishlistController {
    private final WishlistService wishlistService;


    @GetMapping("/my-wishlist")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyWishlist() {
        ApiResponse<List<ProductResponse>> response = wishlistService.getMyWishlist();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addProductToWishlist(@RequestParam Long productId) {
        ApiResponse<Void> response = wishlistService.addProductToWishlist(productId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @DeleteMapping("/remove/{wishlistId}")
    public ResponseEntity<ApiResponse<Void>> removeProductFromWishlist(@PathVariable Long wishlistId) {
        ApiResponse<Void> response = wishlistService.removeProductFromWishlist(wishlistId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearWishlist() {
        ApiResponse<Void> response = wishlistService.clearWishlist();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
