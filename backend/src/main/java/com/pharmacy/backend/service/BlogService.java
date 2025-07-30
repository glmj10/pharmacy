package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.BlogRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.BlogResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BlogService {
    ApiResponse<PageResponse<List<BlogResponse>>> getAllBlogs(int pageIndex, int pageSize, String title, String category);
    ApiResponse<BlogResponse> getBlogBySlug(String slug);
    ApiResponse<BlogResponse> getBlogById(Long id);
    ApiResponse<BlogResponse> createBlog(BlogRequest request, MultipartFile thumbnail);
    ApiResponse<BlogResponse> updateBlog(Long id, BlogRequest request, MultipartFile thumbnail);
    ApiResponse<Void> deleteBlog(Long id);
}
