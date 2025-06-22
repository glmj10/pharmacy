package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.ProductCMSFilterRequest;
import com.pharmacy.backend.dto.request.ProductFilterCustomerRequest;
import com.pharmacy.backend.dto.request.ProductRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.dto.response.ProductResponse;
import com.pharmacy.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<List<ProductResponse>>> getAllActiveProducts(@RequestParam(defaultValue = "1", required = false) int pageIndex,
                                                                                    @RequestParam(defaultValue = "10", required = false) int pageSize,
                                                                                     @ModelAttribute ProductFilterCustomerRequest filterRequest) {
        ApiResponse<PageResponse<List<ProductResponse>>> response = productService.getAllActiveProduct(pageIndex, pageSize, filterRequest);
        return ResponseEntity.status(response.getStatus()).body(response.getData());
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/cms")
    public ResponseEntity<PageResponse<List<ProductResponse>>> getAllCMSProducts(@RequestParam(defaultValue = "1", required = false) int pageIndex,
                                                                                    @RequestParam(defaultValue = "10", required = false) int pageSize,
                                                                                    @ModelAttribute ProductCMSFilterRequest filterRequest) {
        ApiResponse<PageResponse<List<ProductResponse>>> response = productService.getAllCMSProduct(pageIndex, pageSize, filterRequest);
        return ResponseEntity.status(response.getStatus()).body(response.getData());
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ApiResponse<ProductResponse> response = productService.getProductById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ApiResponse<ProductResponse> response = productService.getProductBySlug(slug);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestPart("product") @Valid ProductRequest request,
                                                                       @RequestParam("thumbnail") MultipartFile thumbnail,
                                                                       @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        ApiResponse<ProductResponse> response = productService.createProduct(request, thumbnail, images);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id,
                                                                       @RequestPart("product") @Valid ProductRequest request,
                                                                       @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
                                                                       @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        ApiResponse<ProductResponse> response = productService.updateProduct(id, request, thumbnail, images);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/status/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> changeProductStatus(@PathVariable Long id, @RequestBody Boolean active) {
        ApiResponse<ProductResponse> response = productService.changeProductStatus(id, active);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        ApiResponse<Void> response = productService.deleteProduct(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
