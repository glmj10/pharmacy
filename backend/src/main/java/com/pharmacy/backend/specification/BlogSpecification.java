package com.pharmacy.backend.specification;

import com.pharmacy.backend.entity.Blog;
import org.springframework.data.jpa.domain.Specification;

public class BlogSpecification {

    public static Specification<Blog> hasTitle(String title) {
        return (root, query, criteriaBuilder) -> {
            if (title == null || title.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    public static Specification<Blog> hasCategorySlug(String slug) {
        return (root, query, criteriaBuilder) -> {
            if (slug == null || slug.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("category").get("slug"), slug);
        };
    }

}
