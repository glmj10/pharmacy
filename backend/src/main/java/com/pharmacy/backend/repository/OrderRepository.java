package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Cart;
import com.pharmacy.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCart(Cart cart);
}
