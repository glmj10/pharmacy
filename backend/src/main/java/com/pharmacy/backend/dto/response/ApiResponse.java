package com.pharmacy.backend.dto.response;


import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
public class ApiResponse<T> {
    int status;
    String message;
    T data;
    LocalDateTime timestamp;

    public static <T> ApiResponse <T> buildResponse(int status, String message, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
