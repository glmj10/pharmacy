package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.ProductCMSFilterRequest;
import com.pharmacy.backend.dto.request.ProductFilterCustomerRequest;
import com.pharmacy.backend.dto.request.ProductRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.dto.response.ProductImageResponse;
import com.pharmacy.backend.dto.response.ProductResponse;
import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.ProductMapper;
import com.pharmacy.backend.repository.ProductRepository;
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

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final FileMetadataService fileMetadataService;
    private final ProductImageService productImageService;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getAllCMSProduct(int pageIndex, int pageSize, ProductCMSFilterRequest filterRequest) {
        Specification<Product> productSpecification = ProductSpecification.hasActive(filterRequest.getIsActive())
                .and(ProductSpecification.hasTitle(filterRequest.getTitle()));

        Pageable pageable = createPageable(pageIndex, pageSize, filterRequest.getIsAscending());


        Page<Product> productPage = productRepository.findAll(productSpecification, pageable);
        List<ProductResponse> productResponses = productPage.getContent()
                .stream()
                .map(productMapper::toProductResponse)
                .toList();

        PageResponse<List<ProductResponse>> pageResponse = PageResponse.<List<ProductResponse>>builder()
                .content(productResponses)
                .currentPage(pageIndex)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();

        return ApiResponse.<PageResponse<List<ProductResponse>>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách sản phẩm thành công")
                .data(pageResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getAllActiveProduct(int pageIndex, int pageSize, ProductFilterCustomerRequest filterRequest) {
        Specification<Product> productSpecification = ProductSpecification.hasActive(true)
                .and(ProductSpecification.hasTitle(filterRequest.getTitle()))
                .and(ProductSpecification.hasCategorySlug(filterRequest.getCategorySlug()))
                .and(ProductSpecification.hasBrandSlug(filterRequest.getBrandSlug()))
                .and(ProductSpecification.hasPriceRange(filterRequest.getPriceFrom(), filterRequest.getPriceTo()));

        Pageable pageable = createPageable(pageIndex, pageSize, filterRequest.getIsAscending());

        Page<Product> productPage = productRepository.findAll(productSpecification, pageable);

        List<ProductResponse> productResponses = productPage.getContent()
                .stream()
                .map(productMapper::toProductResponse)
                .toList();

        PageResponse<List<ProductResponse>> pageResponse = PageResponse.<List<ProductResponse>>builder()
                .content(productResponses)
                .currentPage(pageIndex)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();

        return ApiResponse.<PageResponse<List<ProductResponse>>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách sản phẩm thành công")
                .data(pageResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id, "PRODUCT_NOT_FOUND"));
        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        return ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin sản phẩm thành công")
                .data(productResponse)
                .timestamp(LocalDateTime.now())
                .build();
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
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        return ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin sản phẩm thành công")
                .data(productResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<ProductResponse> createProduct(ProductRequest request, MultipartFile thumbnail, List<MultipartFile> images) {
        if(thumbnail == null || thumbnail.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thumbnail không được để trống", "THUMBNAIL_REQUIRED");
        }

        if(images == null || images.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hình ảnh sản phẩm không được để trống", "IMAGES_REQUIRED");
        }

        Product product = productMapper.toProduct(request);
        product.setSlug(createSlug(product.getTitle()));
        product.setThumbnail(fileMetadataService.storeFile(thumbnail, "PRODUCT").getData().getId().toString());

        product = productRepository.save(product);
        List<ProductImageResponse> productImages = productImageService.createProductImages(product, images);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);

        return ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo sản phẩm thành công")
                .data(productResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<ProductResponse> updateProduct(Long id, ProductRequest request, MultipartFile thumbnail, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id, "PRODUCT_NOT_FOUND"));

        if(thumbnail != null && !thumbnail.isEmpty()) {
            product.setThumbnail(fileMetadataService.storeFile(thumbnail, "PRODUCT").getData().getId().toString());
        }

        Product updatedProduct = productMapper.toProductUpdateFromRequest(request, product);

        product = productRepository.save(updatedProduct);

        List<ProductImageResponse> productImages = productImageService.updateProductImages(product, images);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);

        return ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật sản phẩm thành công")
                .data(productResponse)
                .timestamp(LocalDateTime.now())
                .build();
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

        return ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật trạng thái sản phẩm thành công")
                .data(productResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Void> deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id, "PRODUCT_NOT_FOUND"));

        productImageService.deleteProductImagesByProduct(product);
        productRepository.delete(product);

        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Xóa sản phẩm thành công")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public void updateProductQuantity(Product product) {
        Product existingProduct = productRepository.findById(product.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + product.getId(), "PRODUCT_NOT_FOUND"));

        if (product.getQuantity() < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không thể nhỏ hơn 0", "INVALID_PRODUCT_QUANTITY");
        }

        existingProduct.setQuantity(product.getQuantity());
        productRepository.save(existingProduct);

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
            sort = Sort.by(isAscending ? Sort.Direction.ASC : Sort.Direction.DESC, "newPrice");
        }

        return PageRequest.of(pageIndex - 1, pageSize, sort);
    }
}
