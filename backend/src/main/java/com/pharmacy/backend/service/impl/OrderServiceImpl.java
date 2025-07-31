package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.OrderFilterRequest;
import com.pharmacy.backend.dto.request.OrderRequest;
import com.pharmacy.backend.dto.response.*;
import com.pharmacy.backend.entity.*;
import com.pharmacy.backend.enums.OrderStatusEnum;
import com.pharmacy.backend.enums.PaymentMethodEnum;
import com.pharmacy.backend.enums.PaymentStatusEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.OrderMapper;
import com.pharmacy.backend.mapper.ProductMapper;
import com.pharmacy.backend.repository.*;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.EmailService;
import com.pharmacy.backend.service.OrderService;
import com.pharmacy.backend.specification.OrderSpecification;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderServiceImpl implements OrderService {
    final OrderRepository orderRepository;
    final OrderMapper orderMapper;
    final CartRepository cartRepository;
    final UserRepository userRepository;
    final OrderDetailRepository orderDetailRepository;
    final CartItemRepository cartItemRepository;
    final ProfileRepository profileRepository;
    final ProductMapper productMapper;
    final EmailService emailService;
    final VnPayService vnPayService;
    final FileMetadataRepository fileMetadataRepository;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<OrderResponse>>> getAllOrders(int pageIndex, int pageSize, OrderFilterRequest filterRequest) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }
        Specification<Order> orderSpecification = OrderSpecification.hasDateRange(filterRequest.getFromDate(), filterRequest.getToDate())
                .and(OrderSpecification.hasCustomerPhoneNumber(filterRequest.getCustomerPhoneNumber()))
                .and(OrderSpecification.hasOrderId(filterRequest.getId()));

        if(filterRequest.getOrderStatus() != null) {
            orderSpecification = orderSpecification.and(OrderSpecification.hasStatus(
                    OrderStatusEnum.valueOf(filterRequest.getOrderStatus().toUpperCase()).toString())
            );
        }

        if(filterRequest.getPaymentStatus() != null) {
            orderSpecification = orderSpecification.and(OrderSpecification.hasPaymentStatus(
                    PaymentStatusEnum.valueOf(filterRequest.getPaymentStatus().toUpperCase()).toString())
            );
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Order> orderPage = orderRepository.findAll(orderSpecification ,pageable);

        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(order -> {
                    OrderResponse response = orderMapper.toOrderResponse(order);
                    response.setPaymentStatus(order.getPaymentStatus().name());
                    return response;
                })
                .toList();

        PageResponse<List<OrderResponse>> pageResponse = PageResponse.<List<OrderResponse>>builder()
                .currentPage(pageIndex)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .content(orderResponses)
                .build();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách đơn hàng thành công",
                pageResponse
        );
    }

    @Override
    public ApiResponse<PageResponse<List<OrderResponse>>> getMyOrders(int pageIndex, int pageSize, String status) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize, Sort.by("createdAt").descending());

        Long userId = SecurityUtils.getCurrentUserId();
        assert userId != null;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + userId, "User not found"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giỏ hàng cho người dùng với ID: " + userId, "Cart not found"));

        Page<Order> orders;
        if(status != null && !status.isEmpty()) {
            OrderStatusEnum orderStatus = OrderStatusEnum.valueOf(status.toUpperCase());
            orders = orderRepository.findByCartAndStatus(cart, orderStatus, pageable);
        } else {
            orders = orderRepository.findByCart(cart, pageable);
        }

        List<OrderResponse> orderResponses = orders.getContent().stream()
                .map(orderMapper::toOrderResponse)
                .toList();

        PageResponse<List<OrderResponse>> pageResponse = PageResponse.<List<OrderResponse>>builder()
                .currentPage(pageIndex)
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .hasNext(orders.hasNext())
                .hasPrevious(orders.hasPrevious())
                .content(orderResponses)
                .build();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách đơn hàng người dùng thành công",
                pageResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<List<OrderDetailResponse>> getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + orderId, "Order not found"));

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy chi tiết đơn hàng cho ID: " + orderId, "Order details not found"));

        List<OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                .map(orderDetail -> {
                    OrderDetailResponse response = orderMapper.toOrderDetailResponse(orderDetail);
                    ProductResponse productResponse = productMapper.toProductResponse(orderDetail.getProduct());
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(
                            UUID.fromString(orderDetail.getProduct().getThumbnail()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh sản phẩm với ID: " + orderDetail.getProduct().getThumbnail(), "File not found"));
                    productResponse.setThumbnailUrl(fileMetadata.getUrl());
                    response.setProduct(productResponse);
                    return response;
                })
                .toList();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy chi tiết đơn hàng thành công",
                orderDetailResponses
        );
    }

    @Transactional
    @Override
    public ApiResponse<?> createOrder(OrderRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", "User not found"));
        Profile profile = profileRepository.findByUserAndId(user, request.getProfileId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người dùng với ID: " + request.getProfileId(), "Profile not found"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giỏ hàng", "Cart not found"));

        Order order = orderMapper.toOrder(request);
        order.setCustomerName(profile.getFullName());
        order.setCustomerPhoneNumber(profile.getPhoneNumber());
        order.setCustomerAddress(profile.getAddress());
        order.setCart(cart);
        order.setTotalPrice(cart.getTotalPrice());

        switch (PaymentMethodEnum.valueOf(request.getPaymentMethod().toUpperCase())) {
            case VNPAY -> {
                order = orderRepository.save(order);
                createOrderDetails(order, cart);
                HttpServletRequest servletRequest = SecurityUtils.getCurrentHttpServletRequest();
                String paymentUrl = vnPayService.createPaymentUrl(order, servletRequest);
                return ApiResponse.buildResponse(
                        HttpStatus.OK.value(),
                        "Chuyển hướng đến VNPay",
                        paymentUrl
                );
            }
            case MOMO -> {
                // Gọi MoMoService nếu có
                return ApiResponse.buildResponse(
                        HttpStatus.OK.value(),
                        "Chuyển hướng đến MoMo",
                        "https://momo.vn"
                );
            }
            case OFFLINE -> {
                order = orderRepository.save(order);
                createOrderDetails(order, cart);
            }
            default -> throw new AppException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ", "Invalid payment method");
        }

        try {
            emailService.sendOrderConfirmationEmail(order, user.getEmail());
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Gửi email xác nhận đơn hàng thất bại", "Email sending failed");
        }

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        orderResponse.setPaymentStatus(order.getPaymentStatus().name());
        return ApiResponse.buildResponse(
                HttpStatus.CREATED.value(),
                "Tạo đơn hàng thành công",
                orderResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<OrderResponse> changeOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id, "Order not found"));

        order.setStatus(OrderStatusEnum.valueOf(status.toUpperCase()));
        orderRepository.save(order);

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Cập nhật trạng thái đơn hàng thành công",
                orderResponse
        );
    }

    @Override
    public ApiResponse<OrderResponse> changePaymentStatus(Long id, String paymentStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id, "Order not found"));

        // Assuming paymentStatus is a valid enum or string that can be set directly
        order.setPaymentStatus(PaymentStatusEnum.valueOf(paymentStatus.toUpperCase()));
        orderRepository.save(order);

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Cập nhật trạng thái thanh toán đơn hàng thành công",
                orderResponse
        );
    }

    @Override
    public ApiResponse<Long> getTotalOrder() {
        Long totalOrders = orderRepository.count();
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy tổng số đơn hàng thành công",
                totalOrders
        );
    }

    @Override
    public ApiResponse<Long> getAllRevenue() {
        Long totalRevenue = orderRepository.getTotalRevenue("DELIVERED");
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy tổng doanh thu thành công",
                totalRevenue
        );
    }

    @Override
    public ApiResponse<List<OrderResponse>> getFiveNewestOrder() {
        List<Order> newestOrders = orderRepository.findTop5ByOrderByCreatedAtDesc();

        List<OrderResponse> orderResponse = newestOrders.stream()
                .map(order -> {
                    OrderResponse response = orderMapper.toOrderResponse(order);
                    response.setPaymentStatus(order.getPaymentStatus().name());
                    return response;
                })
                .toList();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy 5 đơn hàng mới nhất thành công",
                orderResponse
        );
    }

    @Override
    public ApiResponse<Void> cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id, "Order not found"));

        if (!order.getStatus().equals(OrderStatusEnum.PENDING)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể hủy đơn hàng đang chờ xử lý", "Order cannot be canceled");
        }

        order.setStatus(OrderStatusEnum.CANCELLED);
        orderRepository.save(order);

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Hủy đơn hàng thành công",
                null
        );
    }

    @Transactional
    void createOrderDetails(Order order, Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findAllByCartAndSelected(cart, true);
        if (cartItems.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Giỏ hàng không có sản phẩm nào được chọn", "Cart is empty");
        }

        for (CartItem cartItem : cartItems) {
            if(cartItem.isProductAvailable()) {
                OrderDetail orderDetail = OrderDetail.builder()
                        .order(order)
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .priceAtOrder(cartItem.getProduct().getPriceNew())
                        .build();

                order.getOrderDetails().add(orderDetail);
                Product product = cartItem.getProduct();
                product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            } else {
                throw new AppException(HttpStatus.BAD_REQUEST, "Sản phẩm " + cartItem.getProduct().getTitle()
                        + " không đủ số lượng", "Insufficient product quantity");
            }
        }
        cartItemRepository.deleteAll(cartItems);
        cart.setTotalPrice(cart.getTotalPrice() - cartItems.stream()
                .mapToLong(cartItem -> cartItem.getQuantity() * cartItem.getProduct().getPriceNew())
                .sum());
    }

}
