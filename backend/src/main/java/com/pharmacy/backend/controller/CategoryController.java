package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.CategoryRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.CategoryParentAndChildResponse;
import com.pharmacy.backend.dto.response.CategoryResponse;
import com.pharmacy.backend.service.CategoryService;
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
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        ApiResponse<List<CategoryResponse>> response = categoryService.getAllCategories();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/parent/{parentSlug}")
    public ResponseEntity<ApiResponse<List<CategoryParentAndChildResponse>>> getAllCategoriesByParentSlug(@PathVariable String parentSlug) {
        ApiResponse<List<CategoryParentAndChildResponse>> response = categoryService.getAllCategoriesByParentSlug(parentSlug);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize( "hasRole('ADMIN') or hasRole('STAFF')" )
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        ApiResponse<CategoryResponse> response = categoryService.getCategoryById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @PreAuthorize( "hasRole('ADMIN') or hasRole('STAFF')" )
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@RequestPart("category") @Valid CategoryRequest request,
                                                                        @RequestPart(value = "thumbnail")MultipartFile thumbnail) {
        ApiResponse<CategoryResponse> response = categoryService.createCategory(request, thumbnail);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize( "hasRole('ADMIN') or hasRole('STAFF')" )
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id,
                                                                        @RequestPart("category") @Valid CategoryRequest request,
                                                                        @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        ApiResponse<CategoryResponse> response = categoryService.updateCategory(id, request, thumbnail);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @PreAuthorize( "hasRole('ADMIN') or hasRole('STAFF')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        ApiResponse<Void> response = categoryService.deleteCategory(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
