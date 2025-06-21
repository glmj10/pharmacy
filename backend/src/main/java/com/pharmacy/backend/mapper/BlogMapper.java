package com.pharmacy.backend.mapper;

import com.pharmacy.backend.config.AppConfig;
import com.pharmacy.backend.dto.request.BlogRequest;
import com.pharmacy.backend.dto.response.BlogResponse;
import com.pharmacy.backend.dto.response.CategoryResponse;
import com.pharmacy.backend.entity.Blog;
import com.pharmacy.backend.entity.Category;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BlogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    Blog toBlog(BlogRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    Blog toBlogUpdateFromRequest(BlogRequest request, @MappingTarget Blog blog);

    BlogResponse toBlogResponse(Blog blog);

    @AfterMapping
    default void setThumbnail(@MappingTarget BlogResponse blogResponse, Blog blog) {
        if (blog.getThumbnail() != null) {
            String thumbnailUrl = AppConfig.getFileDownloadUrl(blog.getThumbnail());
            blogResponse.setThumbnail(thumbnailUrl);
        } else {
            blogResponse.setThumbnail(null);
        }
    }
}
