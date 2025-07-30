package com.pharmacy.backend.dto.response;


import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RefreshRequest {
    @NotEmpty(message = "Token không được để trống")
    String token;
}
