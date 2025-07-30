package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.BrandRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.BrandResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/brands")
public class BrandController {
    private final BrandService brandService;

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<BrandResponse>>>> getAllBrands(@RequestParam(defaultValue = "1") int pageIndex,
                                                                                      @RequestParam(defaultValue = "10") int pageSize,
                                                                                      @RequestParam(required = false) String name) {
        ApiResponse<PageResponse<List<BrandResponse>>> response = brandService.getAllBrands(pageIndex, pageSize, name);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/customer/public")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrandsPublic() {
        ApiResponse<List<BrandResponse>> response = brandService.getAllBrands();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable Long id) {
        ApiResponse<BrandResponse> response = brandService.getBrandById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@RequestBody @Valid BrandRequest request) {
        ApiResponse<BrandResponse> response = brandService.createBrand(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(@PathVariable Long id, @RequestBody @Valid BrandRequest request) {
        ApiResponse<BrandResponse> response = brandService.updateBrand(id, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        ApiResponse<Void> response = brandService.deleteBrand(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
