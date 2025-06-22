package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Cart;
import com.pharmacy.backend.entity.CartItem;
import com.pharmacy.backend.entity.Product;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart, Sort createdAt);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    Optional<CartItem> findByCartAndId(Cart cart, Long id);
}
