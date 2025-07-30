package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.config.VnPayConfig;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.enums.OrderStatusEnum;
import com.pharmacy.backend.enums.PaymentStatusEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.repository.OrderRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VnPayService {
    private final OrderRepository orderRepository;
    private final VnPayConfig vnPayConfig;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${frontend.url-payment-return}")
    String frontendUrl;

    @Transactional
    public ApiResponse<String> handleVnPayReturn(Map<String, String> params) {
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String receivedHash = params.get("vnp_SecureHash");

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");

        String generatedHash = hmacSHA512(vnPayConfig.getHashSecret(), buildQueryString(sortedParams));

        if (!generatedHash.equals(receivedHash)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chữ ký không hợp lệ", "Invalid signature");
        }

        Order order = orderRepository.findById(Long.parseLong(vnp_TxnRef))
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Không tìm thấy đơn hàng", "Order not found"));



        if ("00".equals(vnp_ResponseCode)) {
                order.setPaymentStatus(PaymentStatusEnum.COMPLETED);
                order.setStatus(OrderStatusEnum.PENDING);
                try {
                    User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", "User not found"));
                    emailService.sendOrderConfirmationEmail(order, user.getEmail());
                } catch (Exception e) {
                    throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể gửi email xác nhận", "Failed to send confirmation email");
                }
        } else {
                order.setPaymentStatus(PaymentStatusEnum.FAILED);
                order.setStatus(OrderStatusEnum.CANCELLED);
        }

        orderRepository.save(order);
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Thanh toán thành công",
                "Vui lòng kiểm tra email để xem chi tiết đơn hàng"
        );
    }

    public String createPaymentUrl(Order order, HttpServletRequest request) {
        Map<String, String> params = new TreeMap<>();
        String orderId = String.valueOf(order.getId());
        String vnp_OrderInfo = "Thanh toan don hang #" + orderId;
        String vnp_Amount = String.valueOf(order.getTotalPrice() * 100);
        String vnp_IpAddr = request.getRemoteAddr();
        String vnp_CreateDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", vnp_Amount);
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", vnp_OrderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", frontendUrl + "/vnpay-return");
        params.put("vnp_IpAddr", vnp_IpAddr);
        params.put("vnp_CreateDate", vnp_CreateDate);

        String queryString = buildQueryString(params);
        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        return vnPayConfig.getVnpUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }




    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b)); // Changed to lowercase to match VNPay's hash format
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo chữ ký hash", e);
        }
    }
}
