package com.pharmacy.backend.specification;

import com.pharmacy.backend.entity.Order;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class OrderSpecification {

    public static Specification<Order> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Order> hasPaymentStatus(String paymentStatus) {
        return (root, query, criteriaBuilder) -> {
            if (paymentStatus == null || paymentStatus.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus);
        };
    }

    public static Specification<Order> hasDateRange(LocalDateTime fromDate, LocalDateTime toDate) {
        return (root, query, criteriaBuilder) -> {
            if (fromDate == null && toDate == null) {
                return criteriaBuilder.conjunction();
            }
            if (fromDate != null && toDate != null) {
                return criteriaBuilder.between(root.get("createdAt"), fromDate, toDate);
            } else if (fromDate != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), fromDate);
            } else {
                return criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), toDate);
            }
        };
    }

    public static Specification<Order> hasOrderId(Long orderId) {
        return (root, query, criteriaBuilder) -> {
            if (orderId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("id"), orderId);
        };
    }

    public static Specification<Order> hasCustomerPhoneNumber(String phoneNumber) {
        return (root, query, criteriaBuilder) -> {
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("profile").get("phoneNumber")), "%" + phoneNumber.toLowerCase() + "%");
        };
    }


}
