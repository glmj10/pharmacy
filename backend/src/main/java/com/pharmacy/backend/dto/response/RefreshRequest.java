package com.pharmacy.backend.dto.response;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NonNull;

@Data
public class RefreshRequest {
    @NotNull(message = "Token không được để trống")
    @NotEmpty(message = "Token không được để trống")
    String token;
}
