package com.pharmacy.backend.specification;

import com.pharmacy.backend.entity.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasTitle(String title) {
        return (root, query, criteriaBuilder) -> {
            if (title == null || title.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    public static Specification<Product> hasPriceRange(Long priceFrom, Long priceTo) {
        return (root, query, criteriaBuilder) -> {
            if (priceFrom == null && priceTo == null) {
                return criteriaBuilder.conjunction();
            }
            if (priceFrom != null && priceTo != null) {
                return criteriaBuilder.between(root.get("price"), priceFrom, priceTo);
            } else if (priceFrom != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("price"), priceFrom);
            } else {
                return criteriaBuilder.lessThanOrEqualTo(root.get("price"), priceTo);
            }
        };
    }

    public static Specification<Product> hasActive(Boolean active) {
        return (root, query, criteriaBuilder) -> {
            if (active == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("active"), active);
        };
    }

    public static Specification<Product> hasBrandSlug(String slug) {
        return (root, query, criteriaBuilder) -> {
            if (slug == null || slug.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("brand").get("slug"), slug);
        };
    }

    public static Specification<Product> hasCategorySlug(String slug) {
        return (root, query, criteriaBuilder) -> {
            if (slug == null || slug.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("category").get("slug"), slug);
        };
    }
}
