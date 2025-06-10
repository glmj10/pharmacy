package com.pharmacy.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@AllArgsConstructor
@Data
@NoArgsConstructor
@Table(name = "order_details")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    Integer quantity;

    @Column(name = "price_at_order")
    Integer priceAtOrder;

    @ManyToOne
    @JoinColumn(name = "order_id", referencedColumnName = "id")
    Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", referencedColumnName = "id")
    Product product;



}
