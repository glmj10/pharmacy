package com.pharmacy.backend.mapper;

import com.pharmacy.backend.dto.request.BrandRequest;
import com.pharmacy.backend.dto.response.BrandResponse;
import com.pharmacy.backend.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BrandMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "products", ignore = true)
    Brand toBrand(BrandRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "products", ignore = true)
    Brand toBrandUpdateFromRequest(BrandRequest request, @MappingTarget Brand brand);

    BrandResponse toBrandResponse(Brand brand);
}
