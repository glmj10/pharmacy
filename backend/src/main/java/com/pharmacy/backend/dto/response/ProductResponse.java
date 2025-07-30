package com.pharmacy.backend.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    Long id;
    String thumbnailUrl;
    String title;
    Long priceOld;
    Long priceNew;
    Long quantity;
    String manufacturer;
    String type;
    String noted;
    String indication;
    String slug;
    Long priority;
    Boolean active;
    String description;
    String registrationNumber;
    String activeIngredient;
    String dosageForm;
    Boolean inWishlist;
    Long numberOfLikes;
    BrandResponse brand;
    List<CategoryResponse> categories;
    List<ProductImageResponse> images;
}
