package com.pharmacy.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class RoleRequest {
    @NotNull(message = "Mã quyền không được để trống")
    private Set<String> roleCodes;
}
