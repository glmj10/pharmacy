package com.pharmacy.backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CartItemResponse {
    Long id;
    ProductResponse product;
    Long quantity;
    Long priceAtAddition;
    Long priceDifferent;
    String priceChangeType;
    Boolean selected;
    Boolean isOutOfStock;
}
