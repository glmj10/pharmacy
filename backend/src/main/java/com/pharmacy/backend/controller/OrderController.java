package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.OrderRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.OrderDetailResponse;
import com.pharmacy.backend.dto.response.OrderResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService orderService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders() {
        ApiResponse<List<OrderResponse>> response = orderService.getMyOrders();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<List<OrderDetailResponse>>> getOrderDetail(@PathVariable Long id) {
        ApiResponse<List<OrderDetailResponse>> response = orderService.getOrderDetail(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<OrderResponse>>>> getAllOrders(@RequestParam(defaultValue = "1", required = false) int pageIndex,
                                                                  @RequestParam(defaultValue = "10", required = false) int pageSize) {
        ApiResponse<PageResponse<List<OrderResponse>>> response = orderService.getAllOrders(pageIndex, pageSize);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@RequestBody @Valid OrderRequest request) {
        ApiResponse<OrderResponse> response = orderService.createOrder(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/status/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> changeOrderStatus(@PathVariable Long id,
                                                                 @RequestParam(name = "status") String status) {
        ApiResponse<OrderResponse> response = orderService.changeOrderStatus(id, status);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/payment-status/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> changePaymentStatus(@PathVariable Long id,
                                                                        @RequestParam(name = "status") String paymentStatus) {
        ApiResponse<OrderResponse> response = orderService.changePaymentStatus(id, paymentStatus);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
