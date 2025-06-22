package com.pharmacy.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductImageResponse {
    Long id;
    String imageUrl;
}
