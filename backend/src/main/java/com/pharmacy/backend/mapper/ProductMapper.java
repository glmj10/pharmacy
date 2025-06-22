package com.pharmacy.backend.mapper;

import com.pharmacy.backend.config.AppConfig;
import com.pharmacy.backend.dto.request.ProductRequest;
import com.pharmacy.backend.dto.response.CategoryResponse;
import com.pharmacy.backend.dto.response.ProductResponse;
import com.pharmacy.backend.entity.Category;
import com.pharmacy.backend.entity.Product;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product toProduct(ProductRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product toProductUpdateFromRequest(ProductRequest request, @MappingTarget Product product);

    @Mapping(target = "images", ignore = true)
    ProductResponse toProductResponse(Product product);

    @AfterMapping
    default void setThumbnail(@MappingTarget ProductResponse productResponse, Product product) {
        if (product.getThumbnail() != null) {
            String thumbnailUrl = AppConfig.getFileDownloadUrl(product.getThumbnail());
            productResponse.setThumbnailUrl(thumbnailUrl);
        } else {
            productResponse.setThumbnailUrl(null);
        }
    }
}
