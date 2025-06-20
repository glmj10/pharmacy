package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryRequest {
    @NotEmpty(message = "Danh mục không được để trống")
    String name;

    @NotEmpty(message = "Loại danh mục không được để trống")
    String type;

    Long parentId;
}
