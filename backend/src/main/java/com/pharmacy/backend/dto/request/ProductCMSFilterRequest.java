package com.pharmacy.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCMSFilterRequest {
    String title;
    Boolean isAscending;
    Boolean isActive;
}
