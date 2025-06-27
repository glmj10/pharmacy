package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.OrderRequest;
import com.pharmacy.backend.dto.response.*;
import com.pharmacy.backend.entity.*;
import com.pharmacy.backend.enums.OrderStatusEnum;
import com.pharmacy.backend.enums.PaymentMethodEnum;
import com.pharmacy.backend.enums.PaymentStatusEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.OrderMapper;
import com.pharmacy.backend.mapper.ProductMapper;
import com.pharmacy.backend.mapper.ProfileMapper;
import com.pharmacy.backend.repository.*;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.EmailService;
import com.pharmacy.backend.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

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
    final ProfileMapper profileMapper;
    final ProductMapper productMapper;
    final EmailService emailService;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<OrderResponse>>> getAllOrders(int pageIndex, int pageSize) {
        if(pageIndex < 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Order> orderPage = orderRepository.findAll(pageable);

        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(order -> {
                    OrderResponse response = orderMapper.toOrderResponse(order);
                    response.setAddress(profileMapper.toProfileResponse(order.getProfile()));
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

        return ApiResponse.<PageResponse<List<OrderResponse>>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách đơn hàng thành công")
                .data(pageResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<List<OrderResponse>> getMyOrders() {
        Long userId = SecurityUtils.getCurrentUserId();
        assert userId != null;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + userId, "User not found"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giỏ hàng cho người dùng với ID: " + userId, "Cart not found"));

        List<Order> orders = orderRepository.findByCart(cart);

        List<OrderResponse> orderResponses = orders.stream()
                .map(orderResponse -> {
                    OrderResponse response = orderMapper.toOrderResponse(orderResponse);
                    response.setAddress(profileMapper.toProfileResponse(orderResponse.getProfile()));
                    return response;
                })
                .toList();

        return ApiResponse.<List<OrderResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách đơn hàng người dùng thành công")
                .data(orderResponses)
                .timestamp(LocalDateTime.now())
                .build();
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
                    response.setProduct(productMapper.toProductResponse(orderDetail.getProduct()));
                    return response;
                })
                .toList();
        return ApiResponse.<List<OrderDetailResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy chi tiết đơn hàng thành công")
                .data(orderDetailResponses) // Assuming we want the first detail
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<OrderResponse> getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id, "Order not found"));

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin đơn hàng thành công")
                .data(orderResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<OrderResponse> createOrder(OrderRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", "User not found"));
        Profile profile = profileRepository.findByUserAndId(user, request.getProfileId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người dùng với ID: " + request.getProfileId(), "Profile not found"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giỏ hàng", "Cart not found"));

        Order order = orderMapper.toOrder(request);
        order.setProfile(profile);
        order.setCart(cart);
        order.setTotalPrice(cart.getTotalPrice());
        if(request.getPaymentMethod().equalsIgnoreCase(PaymentMethodEnum.ONLINE.name())) {
            return null;
        } else if (request.getPaymentMethod().equalsIgnoreCase(PaymentMethodEnum.OFFLINE.name())) {
            order = orderRepository.save(order);
            createOrderDetails(order, cart);
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ: "
                    + request.getPaymentMethod(), "Invalid payment method");
        }

        try {
            String orderDetailsHtml = buildOrderDetailRow(order.getOrderDetails());
            emailService.sendOrderConfirmationEmail(user.getEmail(), profile, order, orderDetailsHtml);
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Gửi email xác nhận đơn hàng thất bại", "Email sending failed");
        }

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        orderResponse.setAddress(profileMapper.toProfileResponse(profile));
        orderResponse.setPaymentStatus(order.getPaymentStatus().name());
        return ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo đơn hàng thành công")
                .data(orderMapper.toOrderResponse(order))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<OrderResponse> changeOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id, "Order not found"));

        // Assuming status is a valid enum or string that can be set directly
        order.setStatus(OrderStatusEnum.valueOf(status.toUpperCase()));
        orderRepository.save(order);

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật trạng thái đơn hàng thành công")
                .data(orderResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<OrderResponse> changePaymentStatus(Long id, String paymentStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id, "Order not found"));

        // Assuming paymentStatus is a valid enum or string that can be set directly
        order.setPaymentStatus(PaymentStatusEnum.valueOf(paymentStatus.toUpperCase()));
        orderRepository.save(order);

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật trạng thái thanh toán đơn hàng thành công")
                .data(orderResponse)
                .timestamp(LocalDateTime.now())
                .build();
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
                orderDetailRepository.save(orderDetail);

                // Update product quantity
                Product product = cartItem.getProduct();
                product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            } else {
                throw new AppException(HttpStatus.BAD_REQUEST, "Sản phẩm " + cartItem.getProduct().getTitle()
                        + " không đủ số lượng", "Insufficient product quantity");
            }
        }
    }

    @Transactional
    public String buildOrderDetailRow(List<OrderDetail> orderDetails) {
        StringBuilder rows = new StringBuilder();
        int i = 1;
        for( OrderDetail detail : orderDetails) {
            Product p = detail.getProduct();
            long quantity = detail.getQuantity();
            long price = detail.getPriceAtOrder();
            long totalPrice = quantity * price;

            rows.append(String.format("""
            <tr>
              <td style="text-align:center;">%d</td>
              <td>%s</td>
              <td style="text-align:right;">%,.0f₫</td>
              <td style="text-align:center;">%d</td>
              <td style="text-align:right;">%,.0f₫</td>
            </tr>
        """, i++, p.getTitle(), (double) price, quantity, (double) totalPrice));
        }

        return rows.toString();
    }

}
