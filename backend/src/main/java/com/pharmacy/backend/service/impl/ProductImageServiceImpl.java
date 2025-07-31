package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.response.ProductImageResponse;
import com.pharmacy.backend.entity.FileMetadata;
import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.entity.ProductImage;
import com.pharmacy.backend.enums.FileCategoryEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.ProductImageMapper;
import com.pharmacy.backend.repository.FileMetadataRepository;
import com.pharmacy.backend.repository.ProductImageRepository;
import com.pharmacy.backend.service.FileMetadataService;
import com.pharmacy.backend.service.ProductImageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository productImageRepository;
    private final FileMetadataService fileMetadataService;
    private final ProductImageMapper productImageMapper;
    private final FileMetadataRepository fileMetadataRepository;

    @Transactional
    @Override
    public List<ProductImageResponse> getProductImagesByProduct(Product product) {
        return productImageRepository.findByProduct(product)
                .stream()
                .map(productImage -> {
                    ProductImageResponse response = productImageMapper.toProductImageResponse(productImage);
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(productImage.getImageUuid()))
                            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh sản phẩm", "Product image not found"));
                    response.setImageUrl(fileMetadata.getUrl());

                    return response;
                })
                .toList();
    }

    @Transactional
    @Override
    public List<ProductImageResponse> createProductImages(Product product, List<MultipartFile> images) {
        if(images == null || images.isEmpty()) {
            return List.of();
        }
        return images.stream()
                .map(image -> {
                    var fileMetadata = fileMetadataService.storeFile(image, FileCategoryEnum.PRODUCT.name());
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUuid(fileMetadata.getData().getId().toString());

                    productImageRepository.save(productImage);
                    return productImageMapper.toProductImageResponse(productImage);
                })
                .toList();
    }

    @Transactional
    @Override
    public List<ProductImageResponse> updateProductImages(Product product, List<MultipartFile> images) {
        if(images == null || images.isEmpty()) {
            return List.of();
        }

        productImageRepository.deleteByProduct(product);

        return createProductImages(product, images);
    }

    @Transactional
    @Override
    public void deleteProductImagesByProduct(Product product) {
        List<ProductImage> productImages = productImageRepository.findByProduct(product);
        if (productImages.isEmpty()) {
            return;
        }

        for (ProductImage productImage : productImages) {
            fileMetadataService.deleteFile(productImage.getImageUuid());
        }

        productImageRepository.deleteAll(productImages);
    }
}
