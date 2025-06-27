package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    Optional<List<OrderDetail>> findByOrder(Order order);
}
