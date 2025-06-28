package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.OrderRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.OrderDetailResponse;
import com.pharmacy.backend.dto.response.OrderResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.entity.OrderDetail;

import java.util.List;

public interface OrderService {
    ApiResponse<PageResponse<List<OrderResponse>>> getAllOrders(int pageIndex, int pageSize);
    ApiResponse<List<OrderResponse>> getMyOrders();
    ApiResponse<List<OrderDetailResponse>> getOrderDetail(Long orderId);
    ApiResponse<OrderResponse> getOrderById(Long id);
    ApiResponse<?> createOrder(OrderRequest request);
    ApiResponse<OrderResponse> changeOrderStatus(Long id, String status);
    ApiResponse<OrderResponse> changePaymentStatus(Long id, String paymentStatus);
}
