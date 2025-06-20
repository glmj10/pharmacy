package com.pharmacy.backend.mapper;

import com.pharmacy.backend.config.AppConfig;
import com.pharmacy.backend.dto.request.CategoryRequest;
import com.pharmacy.backend.dto.response.CategoryResponse;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.Category;
import com.pharmacy.backend.entity.User;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "blogs", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    Category toCategory(CategoryRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "blogs", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    Category toCategoryUpdateFromRequest(CategoryRequest request, @MappingTarget Category category);


    @Mapping(target = "children", ignore = true)
    CategoryResponse toCategoryResponse(Category category);

    @AfterMapping
    default void setThumbnail(@MappingTarget CategoryResponse categoryResponse, Category category) {
        if(category.getThumbnail() != null) {
            String thumbnailUrl = AppConfig.getFileDownloadUrl(category.getThumbnail());
            categoryResponse.setThumbnail(thumbnailUrl);
        } else {
            categoryResponse.setThumbnail(null);
        }
    }
}
