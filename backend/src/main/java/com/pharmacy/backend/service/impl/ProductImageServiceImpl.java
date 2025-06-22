package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.response.ProductImageResponse;
import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.entity.ProductImage;
import com.pharmacy.backend.enums.FileCategory;
import com.pharmacy.backend.mapper.ProductImageMapper;
import com.pharmacy.backend.repository.ProductImageRepository;
import com.pharmacy.backend.service.FileMetadataService;
import com.pharmacy.backend.service.ProductImageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository productImageRepository;
    private final FileMetadataService fileMetadataService;
    private final ProductImageMapper productImageMapper;

    @Override
    public List<ProductImageResponse> getProductImagesByProduct(Product product) {
        return productImageRepository.findByProduct(product)
                .stream()
                .map(productImageMapper::toProductImageResponse)
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
                    var fileMetadata = fileMetadataService.storeFile(image, FileCategory.PRODUCT.name());
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
