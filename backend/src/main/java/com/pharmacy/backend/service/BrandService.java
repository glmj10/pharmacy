package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.BrandRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.BrandResponse;
import com.pharmacy.backend.dto.response.PageResponse;

import java.util.List;

public interface BrandService {
    ApiResponse<PageResponse<List<BrandResponse>>> getAllBrands(int pageIndex, int pageSize, String name);
    ApiResponse<BrandResponse> getBrandById(Long id);
    ApiResponse<BrandResponse> createBrand(BrandRequest request);
    ApiResponse<BrandResponse> updateBrand(Long id, BrandRequest request);
    ApiResponse<Void> deleteBrand(Long id);
}
