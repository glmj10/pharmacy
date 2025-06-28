package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.service.impl.VnPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PaymentController {
    private final VnPayService vnPayService;

    @PreAuthorize("hasRole('USER')")
    @RequestMapping("/api/v1/vnpay/return")
    public ResponseEntity<ApiResponse<String>> handleVnPayReturn(@RequestParam Map<String, String> params) {
        ApiResponse<String> response = vnPayService.handleVnPayReturn(params);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
