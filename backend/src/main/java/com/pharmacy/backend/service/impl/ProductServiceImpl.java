package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.ProductCMSFilterRequest;
import com.pharmacy.backend.dto.request.ProductFilterCustomerRequest;
import com.pharmacy.backend.dto.request.ProductRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.dto.response.ProductImageResponse;
import com.pharmacy.backend.dto.response.ProductResponse;
import com.pharmacy.backend.entity.*;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.BrandMapper;
import com.pharmacy.backend.mapper.CategoryMapper;
import com.pharmacy.backend.mapper.ProductMapper;
import com.pharmacy.backend.repository.*;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.FileMetadataService;
import com.pharmacy.backend.service.ProductImageService;
import com.pharmacy.backend.service.ProductService;
import com.pharmacy.backend.specification.ProductSpecification;
import com.pharmacy.backend.utils.SlugUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final FileMetadataService fileMetadataService;
    private final ProductImageService productImageService;
    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final CategoryRepository categoryRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;
    private final FileMetadataRepository fileMetadataRepository;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getAllCMSProduct(int pageIndex, int pageSize, ProductCMSFilterRequest filterRequest) {
        Specification<Product> productSpecification = ProductSpecification.hasActive(filterRequest.getIsActive())
                .and(ProductSpecification.hasTitle(filterRequest.getTitle()));

        Pageable pageable = createPageable(pageIndex, pageSize, filterRequest.getIsAscending());

        Page<Product> productPage = productRepository.findAll(productSpecification, pageable);
        List<ProductResponse> productResponses = productPage.getContent()
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    response.setBrand(brandMapper.toBrandResponse(product.getBrand()));
                    response.setCategories(
                            product.getCategories().stream()
                                    .map(categoryMapper::toCategoryResponse)
                                    .collect(Collectors.toList())
                    );
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm", "THUMBNAIL_NOT_FOUND"));
                    response.setThumbnailUrl(
                            fileMetadata.getUrl()
                    );

                    return response;
                })
                .toList();

        PageResponse<List<ProductResponse>> pageResponse = PageResponse.<List<ProductResponse>>builder()
                .content(productResponses)
                .currentPage(pageIndex)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách sản phẩm thành công",
                pageResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getAllActiveProduct(int pageIndex, int pageSize, ProductFilterCustomerRequest filterRequest) {
        Specification<Product> productSpecification = ProductSpecification.hasActive(true)
                .and(ProductSpecification.hasTitle(filterRequest.getTitle()))
                .and(ProductSpecification.hasCategorySlug(filterRequest.getCategory()))
                .and(ProductSpecification.hasBrandSlug(filterRequest.getBrand()))
                .and(ProductSpecification.hasPriceRange(filterRequest.getPriceFrom(), filterRequest.getPriceTo()));


        Pageable pageable = createPageable(pageIndex, pageSize, filterRequest.getIsAscending());

        Page<Product> productPage = productRepository.findAll(productSpecification, pageable);

        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "USER_NOT_FOUND"));
        } else {
            user = null;
        }

        List<ProductResponse> productResponses = productPage.getContent()
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    if(user != null) {
                        Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                        response.setInWishlist(isInWishList);
                    } else {
                        response.setInWishlist(false);
                    }

                    response.setBrand(brandMapper.toBrandResponse(product.getBrand()));
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm", "THUMBNAIL_NOT_FOUND"));
                    response.setThumbnailUrl(
                            fileMetadata.getUrl()
                    );

                    return response;
                })
                .toList();

        PageResponse<List<ProductResponse>> pageResponse = PageResponse.<List<ProductResponse>>builder()
                .content(productResponses)
                .currentPage(pageIndex)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy danh sách sản phẩm thành công",
                pageResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id, "PRODUCT_NOT_FOUND"));
        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        productResponse.setBrand(brandMapper.toBrandResponse(product.getBrand()));
        List<Category> categories = categoryRepository.findAllByProductsContains(product);
        productResponse.setCategories(categories.stream().map(categoryMapper::toCategoryResponse).collect(Collectors.toList()));
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy thông tin sản phẩm thành công",
                productResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với slug: " + slug, "PRODUCT_NOT_FOUND"));
        if (!product.getActive()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không còn hoạt động", "PRODUCT_INACTIVE");
        }
        ProductResponse productResponse = productMapper.toProductResponse(product);
        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "USER_NOT_FOUND"));
            productResponse.setInWishlist(wishlistRepository.existsByProductAndUser(product, user));
        } else {
            productResponse.setInWishlist(false);
        }
        
        Brand brand = brandRepository.findById(product.getBrand().getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với ID: "
                        + product.getBrand().getId(), "BRAND_NOT_FOUND"));

        productResponse.setBrand(brandMapper.toBrandResponse(brand));
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy thông tin sản phẩm thành công",
                productResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> createProduct(ProductRequest request, MultipartFile thumbnail, List<MultipartFile> images) {
        if(thumbnail == null || thumbnail.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thumbnail không được để trống", "THUMBNAIL_REQUIRED");
        }

        if(images == null || images.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hình ảnh sản phẩm không được để trống", "IMAGES_REQUIRED");
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với ID: " + request.getBrandId(), "BRAND_NOT_FOUND"));

        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());

        if (categories.isEmpty()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục nào với ID đã cung cấp", "CATEGORIES_NOT_FOUND");
        }

        Product product = productMapper.toProduct(request);
        product.setSlug(createSlug(product.getTitle()));
        product.setThumbnail(fileMetadataService.storeFile(thumbnail, "PRODUCT").getData().getId().toString());
        product.setBrand(brand);
        product.setCategories(categories);

        product = productRepository.save(product);
        images.addFirst(thumbnail);
        List<ProductImageResponse> productImages = productImageService.createProductImages(product, images);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);

        return ApiResponse.buildResponse(
                HttpStatus.CREATED.value(),
                "Tạo sản phẩm thành công",
                productResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> updateProduct(Long id, ProductRequest request, MultipartFile thumbnail, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id, "PRODUCT_NOT_FOUND"));

        if(thumbnail != null && !thumbnail.isEmpty()) {
            product.setThumbnail(fileMetadataService.storeFile(thumbnail, "PRODUCT").getData().getId().toString());
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy thương hiệu với ID: " + request.getBrandId(), "BRAND_NOT_FOUND"));
        Product updatedProduct = productMapper.toProductUpdateFromRequest(request, product);;
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        updatedProduct.setBrand(brand);
        updatedProduct.setCategories(categories);
        product = productRepository.save(updatedProduct);

        List<ProductImageResponse> productImages = productImageService.updateProductImages(product, images);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Cập nhật sản phẩm thành công",
                productResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> changeProductStatus(Long id, Boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id, "PRODUCT_NOT_FOUND"));

        product.setActive(active);
        product = productRepository.save(product);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImageService.getProductImagesByProduct(product));

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Cập nhật trạng thái sản phẩm thành công",
                productResponse
        );
    }

    @Override
    public ApiResponse<Void> deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id, "PRODUCT_NOT_FOUND"));

        productImageService.deleteProductImagesByProduct(product);
        productRepository.delete(product);

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Xóa sản phẩm thành công",
                null
        );
    }

    @Override
    public ApiResponse<Long> getTotalProduct() {
        long totalProducts = productRepository.count();
        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy tổng số sản phẩm thành công",
                totalProducts
        );
    }

    @Transactional
    @Override
    public ApiResponse<List<ProductResponse>> getTop15ProductsByNumberOfLikes() {
        Pageable pageable = PageRequest.of(0, 15, Sort.by(Sort.Direction.DESC, "numberOfLikes"));
        List<Product> products = productRepository.findTop15ByActiveTrue((pageable));
        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "USER_NOT_FOUND"));
        } else {
            user = null;
        }

        List<ProductResponse> productResponses = products
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    if(user != null) {
                        Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                        response.setInWishlist(isInWishList);
                    } else {
                        response.setInWishlist(false);
                    }

                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm", "THUMBNAIL_NOT_FOUND"));
                    response.setThumbnailUrl(fileMetadata.getUrl());
                    return response;
                })
                .toList();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy 15 sản phẩm hàng đầu theo số lượt thích thành công",
                productResponses
        );
    }

    @Transactional
    @Override
    public ApiResponse<List<ProductResponse>> get15ProductByBrand(Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với ID: " + brandId, "BRAND_NOT_FOUND"));

        List<Product> products = productRepository.findTop15ByBrandAndActive(brand, true);
        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "USER_NOT_FOUND"));
        } else {
            user = null;
        }

        List<ProductResponse> productResponses = products
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    if(user != null) {
                        Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                        response.setInWishlist(isInWishList);
                    } else {
                        response.setInWishlist(false);
                    }
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm", "THUMBNAIL_NOT_FOUND"));
                    response.setThumbnailUrl(fileMetadata.getUrl());

                    return response;
                })
                .toList();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy 10 sản phẩm theo thương hiệu thành công",
                productResponses
        );
    }


    private String createSlug(String name) {
        String baseSlug = SlugUtils.generateSlug(name);
        int cnt = 1;
        String slug = baseSlug;
        while(productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + cnt++;
        }
        return slug;
    }

    private Pageable createPageable(int pageIndex, int pageSize, Boolean isAscending) {
        if (pageIndex <= 0) {
            pageIndex = 1;
        }
        if (pageSize <= 0) {
            pageSize = 10;
        }
        Sort sort;
        if (isAscending == null) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        } else {
            sort = Sort.by(isAscending ? Sort.Direction.ASC : Sort.Direction.DESC, "priceNew");
        }

        return PageRequest.of(pageIndex - 1, pageSize, sort);
    }

}
