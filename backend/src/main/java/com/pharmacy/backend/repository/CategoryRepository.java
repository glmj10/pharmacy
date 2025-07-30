package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Category;
import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.enums.CategoryTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String parentSlug);

    List<Category> findByParent(Category parent);

    List<Category> findByType(CategoryTypeEnum categoryTypeEnum);

    List<Category> findAllByProductsContains(Product product);
}
