package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Page<Brand> findByNameContainingIgnoreCase(String name, Pageable pageable);
    boolean existsBySlug(String slug);
}
