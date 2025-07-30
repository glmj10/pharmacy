package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Cart;
import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.enums.OrderStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Page<Order> findByCart(Cart cart, Pageable pageable);

    @Query(value = "SELECT SUM(o.total_price) FROM orders o WHERE o.status = :status",
            nativeQuery = true
    )
    Long getTotalRevenue(@Param("status") String status);


    List<Order> findTop5ByOrderByCreatedAtDesc();

    Page<Order> findByCartAndStatus(Cart cart, OrderStatusEnum orderStatus, Pageable pageable);
}
