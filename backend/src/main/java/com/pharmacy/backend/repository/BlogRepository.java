package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    boolean existsBySlug(String slug);

    Optional<Blog> findBySlug(String slug);

    Page<Blog> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
