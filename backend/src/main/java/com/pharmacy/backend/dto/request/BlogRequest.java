package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BlogRequest {
    @NotEmpty(message = "Tên bài viết không được để trống")
    String title;
    @NotEmpty(message = "Nội dung bài viết không được để trống")
    String content;
    @NotNull(message = "Danh mục không được để trống")
    Long categoryId;
}
