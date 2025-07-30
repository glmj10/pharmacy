package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.BlogRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.BlogResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.service.BlogService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/api/v1/blogs")
@Controller
public class BlogController {
    private final BlogService blogService;

    @Transactional
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<BlogResponse>>>> getAllBlogs(@RequestParam(defaultValue = "1") int pageIndex,
                                                                                   @RequestParam(defaultValue = "10") int pageSize,
                                                                                   @RequestParam(required = false) String title,
                                                                                     @RequestParam(required = false) String category) {
        ApiResponse<PageResponse<List<BlogResponse>>> response = blogService.getAllBlogs(pageIndex, pageSize, title, category);

        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<BlogResponse>> getBlogBySlug(@PathVariable String slug) {
        ApiResponse<BlogResponse> response = blogService.getBlogBySlug(slug);

        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<BlogResponse>> getBlogById(@PathVariable Long id) {
        ApiResponse<BlogResponse> response = blogService.getBlogById(id);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PostMapping
    public ResponseEntity<ApiResponse<BlogResponse>> createBlog(@RequestPart("blog") @Valid BlogRequest request,
                                                                @RequestPart("thumbnail") MultipartFile thumbnail) {
        ApiResponse<BlogResponse> response = blogService.createBlog(request, thumbnail);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogResponse>> updateBlog(@PathVariable Long id,
                                                                @RequestPart("blog") @Valid BlogRequest request,
                                                                @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        ApiResponse<BlogResponse> response = blogService.updateBlog(id, request, thumbnail);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBlog(@PathVariable Long id) {
        ApiResponse<Void> response = blogService.deleteBlog(id);

        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
