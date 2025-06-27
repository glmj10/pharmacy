package com.pharmacy.backend.mapper;

import com.pharmacy.backend.dto.request.OrderRequest;
import com.pharmacy.backend.dto.response.OrderDetailResponse;
import com.pharmacy.backend.dto.response.OrderResponse;
import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.entity.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paymentStatus", constant = "PENDING")
    @Mapping(target = "profile", ignore = true)
    @Mapping(target = "cart", ignore = true)
    Order toOrder(OrderRequest request);

    OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);

    OrderResponse toOrderResponse(Order order);
}
