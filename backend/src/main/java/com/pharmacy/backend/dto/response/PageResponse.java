package com.pharmacy.backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.experimental.FieldDefaults;

@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> {
    int currentPage;
    int totalPages;
    long totalElements;
    boolean hasNext;
    boolean hasPrevious;
    T content;
}
