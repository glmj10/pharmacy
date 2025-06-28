package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.ProductCMSFilterRequest;
import com.pharmacy.backend.dto.request.ProductFilterCustomerRequest;
import com.pharmacy.backend.dto.request.ProductRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    ApiResponse<PageResponse<List<ProductResponse>>> getAllCMSProduct(int pageIndex,
                                                                      int pageSize,
                                                                      ProductCMSFilterRequest filterRequest);
    ApiResponse<PageResponse<List<ProductResponse>>> getAllActiveProduct(int pageIndex,
                                                                         int pageSize,
                                                                         ProductFilterCustomerRequest filterRequest);
    ApiResponse<ProductResponse> getProductById(Long id);
    ApiResponse<ProductResponse> getProductBySlug(String slug);
    ApiResponse<ProductResponse> createProduct(ProductRequest request,
                                               MultipartFile thumbnail,
                                               List<MultipartFile> images);
    ApiResponse<ProductResponse> updateProduct(Long id, ProductRequest request,
                                               MultipartFile thumbnail, List<MultipartFile> images);
    ApiResponse<ProductResponse> changeProductStatus(Long id, Boolean active);
    ApiResponse<Void> deleteProduct(Long id);
}
