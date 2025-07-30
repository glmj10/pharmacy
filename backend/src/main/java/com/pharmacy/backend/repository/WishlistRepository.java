package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findAllByUser_Id(Long userId);

    Optional<Wishlist> findByUserAndProduct(User user, Product product);

    List<Wishlist> findAllByUser(User user);

    Boolean existsByProductAndUser(Product product, User user);

    boolean existsByUserAndProduct(User user, Product product);
}
