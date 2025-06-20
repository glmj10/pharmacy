package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.BrandRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.BrandResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.entity.Brand;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.BrandMapper;
import com.pharmacy.backend.repository.BrandRepository;
import com.pharmacy.backend.service.BrandService;
import com.pharmacy.backend.utils.SlugUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<BrandResponse>>> getAllBrands(int pageIndex, int pageSize, String name) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Brand> brandPage;
        if(name != null && !name.isEmpty()) {
            brandPage = brandRepository.findByNameContainingIgnoreCase(name, pageable);
        } else {
            brandPage = brandRepository.findAll(pageable);
        }

        List<BrandResponse> brandResponses = brandPage.getContent().stream()
                .map(brandMapper::toBrandResponse)
                .toList();

        PageResponse<List<BrandResponse>> pageResponse = PageResponse.<List<BrandResponse>>builder()
                .content(brandResponses)
                .currentPage(pageIndex)
                .totalElements(brandPage.getTotalElements())
                .totalPages(brandPage.getTotalPages())
                .hasNext(brandPage.hasNext())
                .hasPrevious(brandPage.hasPrevious())
                .build();

        return ApiResponse.<PageResponse<List<BrandResponse>>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách thương hiệu thành công")
                .data(pageResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }


    @Transactional
    @Override
    public ApiResponse<BrandResponse> getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Thương hiệu không tồn tại", "Brand not found with id: " + id));

        BrandResponse brandResponse = brandMapper.toBrandResponse(brand);

        return ApiResponse.<BrandResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin thương hiệu thành công")
                .data(brandResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<BrandResponse> createBrand(BrandRequest request) {
        Brand brand = brandMapper.toBrand(request);

        brand.setSlug(createSlug(brand.getName()));
        brand = brandRepository.save(brand);

        BrandResponse brandResponse = brandMapper.toBrandResponse(brand);

        return ApiResponse.<BrandResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo thương hiệu thành công")
                .data(brandResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<BrandResponse> updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Thương hiệu không tồn tại", "Brand not found with id: " + id));

        Brand updatedBrand = brandMapper.toBrandUpdateFromRequest(request, brand);
        updatedBrand.setSlug(createSlug(updatedBrand.getName()));

        brand = brandRepository.save(brand);

        BrandResponse brandResponse = brandMapper.toBrandResponse(brand);

        return ApiResponse.<BrandResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật thương hiệu thành công")
                .data(brandResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }


    @Transactional
    @Override
    public ApiResponse<Void> deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Thương hiệu không tồn tại", "Brand not found with id: " + id));

        brandRepository.delete(brand);

        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Xoá thương hiệu thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    private String createSlug(String name) {
        String baseSlug = SlugUtils.generateSlug(name);
        int cnt = 1;
        String slug = baseSlug;
        while(brandRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + cnt++;
        }
        return slug;
    }
}
