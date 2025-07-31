package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.OrderFilterRequest;
import com.pharmacy.backend.dto.request.OrderRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.OrderDetailResponse;
import com.pharmacy.backend.dto.response.OrderResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.entity.OrderDetail;

import java.util.List;

public interface OrderService {
    ApiResponse<PageResponse<List<OrderResponse>>> getAllOrders(int pageIndex, int pageSize, OrderFilterRequest request);
    ApiResponse<PageResponse<List<OrderResponse>>> getMyOrders(int pageIndex, int pageSize, String status);
    ApiResponse<List<OrderDetailResponse>> getOrderDetail(Long orderId);
    ApiResponse<?> createOrder(OrderRequest request);
    ApiResponse<OrderResponse> changeOrderStatus(Long id, String status);
    ApiResponse<OrderResponse> changePaymentStatus(Long id, String paymentStatus);
    ApiResponse<Long> getTotalOrder();

    ApiResponse<Long> getAllRevenue();

    ApiResponse<List<OrderResponse>> getFiveNewestOrder();
    ApiResponse<Void> cancelOrder(Long id);
}
