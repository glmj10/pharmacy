package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.CategoryRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.CategoryParentAndChildResponse;
import com.pharmacy.backend.dto.response.CategoryResponse;
import com.pharmacy.backend.entity.Category;
import com.pharmacy.backend.entity.FileMetadata;
import com.pharmacy.backend.enums.CategoryTypeEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.CategoryMapper;
import com.pharmacy.backend.repository.CategoryRepository;
import com.pharmacy.backend.repository.FileMetadataRepository;
import com.pharmacy.backend.service.CategoryService;
import com.pharmacy.backend.service.FileMetadataService;
import com.pharmacy.backend.utils.SlugUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final FileMetadataService fileMetadataService;
    private final FileMetadataRepository fileMetadataRepository;

    @Transactional
    @Override
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponse> response = buildTree(categories);
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh mục thành công",
                response
        );
    }

    @Transactional
    @Override
    public ApiResponse<List<CategoryParentAndChildResponse>> getAllCategoriesByParentSlug(String parentSlug) {
        CategoryParentAndChildResponse response = new CategoryParentAndChildResponse();
        Category parentCategory = categoryRepository.findBySlug(parentSlug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy danh mục với slug: " + parentSlug, "Category not found"));

        response.setParent(categoryMapper.toCategoryResponse(parentCategory));
        FileMetadata parentFileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(parentCategory.getThumbnail()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thumbnail không tồn tại", "Thumbnail not found"));
        response.getParent().setThumbnail(parentFileMetadata.getUrl());

        List<Category> childCategories = categoryRepository.findByParent(parentCategory);

        response.setChildren(childCategories.stream()
                .map(
                        category -> {
                            CategoryResponse childResponse = categoryMapper.toCategoryResponse(category);
                            FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(category.getThumbnail()))
                                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thumbnail không tồn tại", "Thumbnail not found"));
                            childResponse.setThumbnail(fileMetadata.getUrl());
                            childResponse.setParentId(parentCategory.getId());
                            return childResponse;
                        }
                )
                .toList());
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh mục con thành công",
                List.of(response)
        );
    }

    @Transactional
    @Override
    public ApiResponse<CategoryResponse> getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id, "Category not found"));

        CategoryResponse response = categoryMapper.toCategoryResponse(category);
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(category.getThumbnail()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thumbnail không tồn tại", "Thumbnail not found"));
        response.setThumbnail(fileMetadata.getUrl());
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh mục thành công",
                response
        );
    }

    @Transactional
    @Override
    public ApiResponse<CategoryResponse> createCategory(CategoryRequest request, MultipartFile thumbnail) {
        Category category = categoryMapper.toCategory(request);

        category.setSlug(createSlug(category.getName()));
        if(thumbnail == null || thumbnail.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thumbnail không được để trống", "Thumbnail is required");
        }

        var thumbnailResponse = fileMetadataService.storeFile(thumbnail, "CATEGORY");

        category.setThumbnail(thumbnailResponse.getData().getId().toString());
        if(request.getParentId() != null) {
            Category parentCategory = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                            "Không tìm thấy danh mục cha với ID: " + request.getParentId(), "Parent category not found"));
            category.setParent(parentCategory);
        }
        Category savedCategory = categoryRepository.save(category);

        CategoryResponse response = categoryMapper.toCategoryResponse(savedCategory);
        return ApiResponse.buildResponse(
                HttpStatus.CREATED.value(),
                "Tạo danh mục thành công",
                response
        );
    }

    @Transactional
    @Override
    public ApiResponse<CategoryResponse> updateCategory(Long id, CategoryRequest request, MultipartFile thumbnail) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id, "Category not found"));

        Category updatedCategory = categoryMapper.toCategoryUpdateFromRequest(request, existingCategory);
        updatedCategory.setSlug(createSlug(updatedCategory.getName()));

        if (thumbnail != null && !thumbnail.isEmpty()) {
            fileMetadataService.deleteFile(existingCategory.getThumbnail());
            var thumbnailResponse = fileMetadataService.storeFile(thumbnail, "CATEGORY");
            updatedCategory.setThumbnail(thumbnailResponse.getData().getId().toString());
        }

        if(request.getParentId() != null) {
            Category parentCategory = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                            "Không tìm thấy danh mục cha với ID: " + request.getParentId(), "Parent category not found"));
            updatedCategory.setParent(parentCategory);
        } else {
            updatedCategory.setParent(null);
        }

        Category savedCategory = categoryRepository.save(updatedCategory);

        CategoryResponse response = categoryMapper.toCategoryResponse(savedCategory);
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Cập nhật danh mục thành công",
                response
        );
    }

    @Transactional
    @Override
    public ApiResponse<Void> deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id, "Category not found"));

        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Danh mục này có danh mục con, không thể xóa", "Category has children");
        }

        fileMetadataService.deleteFile(category.getThumbnail());
        categoryRepository.delete(category);

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Xóa danh mục thành công",
                null
        );
    }

    @Override
    public ApiResponse<List<CategoryResponse>> getAllProductCategories() {
        List<Category> categories = categoryRepository.findByType(CategoryTypeEnum.PRODUCT);
        List<CategoryResponse> response = buildTree(categories);
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh mục sản phẩm thành công",
                response
        );
    }


    @Override
    public ApiResponse<List<CategoryResponse>> getAllBlogCategories() {
        List<Category> categories = categoryRepository.findByType(CategoryTypeEnum.BLOG);
        List<CategoryResponse> response = buildTree(categories);
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh mục blog thành công",
                response
        );
    }

    private String createSlug(String name) {
        String baseSlug = SlugUtils.generateSlug(name);
        int cnt = 1;
        String slug = baseSlug;
        while(categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + cnt++;
        }
        return slug;
    }

    List<CategoryResponse> buildTree(List<Category> allCategories) {
        Map<Long, CategoryResponse> map = new HashMap<>();
        List<CategoryResponse> roots = new ArrayList<>();

        for (Category c : allCategories) {
            CategoryResponse dto = categoryMapper.toCategoryResponse(c);
            FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(c.getThumbnail()))
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thumbnail không tồn tại", "Thumbnail not found"));
            dto.setThumbnail(fileMetadata.getUrl());
            dto.setChildren(new ArrayList<>());
            map.put(c.getId(), dto);
        }

        for (Category c : allCategories) {
            Long parentId = c.getParent() != null ? c.getParent().getId() : null;
            if (parentId == null) {
                roots.add(map.get(c.getId()));
            } else {
                CategoryResponse parent = map.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(map.get(c.getId()));
                }
            }
        }

        return roots;
    }
}
