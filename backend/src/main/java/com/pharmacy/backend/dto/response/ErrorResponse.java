package com.pharmacy.backend.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    int status;
    String message;
    Object errors;
    LocalDateTime timestamp;
}
