package com.pharmacy.backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class BlogResponse {
    Long id;
    String title;
    String content;
    String thumbnail;
    String slug;
    LocalDateTime createdAt;
}
