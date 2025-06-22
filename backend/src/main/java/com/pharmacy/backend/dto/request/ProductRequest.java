package com.pharmacy.backend.dto.request;

import com.pharmacy.backend.entity.Category;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRequest {
    @NotEmpty(message = "Tên sản phẩm không được để trống")
    String title;

    @NotNull(message = "Giá cũ không được để trống")
    Long priceOld;

    @NotNull(message = "Giá mới không được để trống")
    Long priceNew;

    @NotNull(message = "Số lượng không được để trống")
    Long quantity;

    @NotEmpty(message = "Nhà sản xuất không được để trống")
    String manufacturer;

    @NotEmpty(message = "Loại sản phẩm không được để trống")
    String type;

    @NotEmpty(message = "Ghi chú không được để trống")
    String noted;

    @NotEmpty(message = "Chỉ định không được để trống")
    String indication;

    Long priority;

    @NotEmpty(message = "Mô tả không được để trống")
    String description;

    @NotEmpty(message = "Số đăng ký không được để trống")
    String registrationNumber;

    @NotEmpty(message = "Hoạt chất không được để trống")
    String activeIngredient;

    @NotEmpty(message = "Dạng bào chế không được để trống")
    String dosageForm;

    @NotNull(message = "Nhãn hiệu không được để trống")
    Long brandId;

    @NotEmpty(message = "Danh sách danh mục không được để trống")
    Set<Long> categoryIds;
}
