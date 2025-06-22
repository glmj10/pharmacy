package com.pharmacy.backend.mapper;

import com.pharmacy.backend.config.AppConfig;
import com.pharmacy.backend.dto.response.ProductImageResponse;
import com.pharmacy.backend.entity.ProductImage;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {

    ProductImageResponse toProductImageResponse(ProductImage productImage);

    @AfterMapping
    default void setImageUrl(@MappingTarget ProductImageResponse productImageResponse, ProductImage productImage) {
        if (productImage.getImageUuid() != null) {
            String imageUrl = AppConfig.getFileDownloadUrl(productImage.getImageUuid());
            productImageResponse.setImageUrl(imageUrl);
        } else {
            productImageResponse.setImageUrl(null);
        }
    }
}
