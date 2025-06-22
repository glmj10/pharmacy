package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Cart;
import com.pharmacy.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    boolean existsByUser(User user);

    Optional<Cart> findByUser(User user);
}
