package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequest {
    @NotNull(message = "Địa chỉ người dùng không được để trống")
    Long profileId;

    @NotNull(message = "Tổng giá không được để trống")
    String note;
    @NotNull(message = "Phương thức thanh toán không được để trống")
    String paymentMethod;
}
