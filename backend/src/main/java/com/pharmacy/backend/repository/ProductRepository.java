package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Brand;
import com.pharmacy.backend.entity.Category;
import com.pharmacy.backend.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsBySlug(String slug);

    Optional<Product> findBySlug(String slug);

    List<Product> findTop15ByActiveTrue(Pageable pageable);

    List<Product> findTop15ByBrandAndActive(Brand brand, boolean b);
}
