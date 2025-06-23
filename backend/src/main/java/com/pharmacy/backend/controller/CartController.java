package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.CartItemRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.CartItemResponse;
import com.pharmacy.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/carts")
@RequiredArgsConstructor
@PreAuthorize( "hasRole('USER')")
@Controller
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemResponse>>> getCartItems() {
        ApiResponse<List<CartItemResponse>> response = cartService.getItemsInCart();

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartItemResponse>> addItemToCart(@RequestBody CartItemRequest request) {
        ApiResponse<CartItemResponse> response = cartService.addItemToCart(request);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/item/{itemId}")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateItemQuantity(@PathVariable Long itemId,
                                                                            @RequestParam("quantity") Long quantity) {
        ApiResponse<CartItemResponse> response = cartService.updateItemQuantity(itemId, quantity);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItemFromCart(@PathVariable Long itemId) {
        ApiResponse<Void> response = cartService.removeItemFromCart(itemId);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        ApiResponse<Void> response = cartService.clearCart();

        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
