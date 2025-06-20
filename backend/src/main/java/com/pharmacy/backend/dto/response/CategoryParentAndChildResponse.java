package com.pharmacy.backend.dto.response;

import com.pharmacy.backend.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryParentAndChildResponse {
    CategoryResponse parent;
    List<CategoryResponse> children;
}
