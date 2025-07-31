package com.pharmacy.backend.mapper;

import com.pharmacy.backend.dto.response.ProductImageResponse;
import com.pharmacy.backend.entity.ProductImage;
import org.mapstruct.*;


@Mapper(componentModel = "spring")
public abstract class ProductImageMapper {

    public abstract ProductImageResponse toProductImageResponse(ProductImage productImage);

}
