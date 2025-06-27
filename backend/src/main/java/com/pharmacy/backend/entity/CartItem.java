package com.pharmacy.backend.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "cart_items")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    Long quantity;

    @Column(name = "price_at_addition")
    Long priceAtAddition;

    Boolean selected = false;

    public boolean isOutOfStock() {
        return product.getQuantity() <= 0;
    }

    public boolean isProductAvailable() {
        return product.getQuantity() >= quantity;
    }

    @ManyToOne
    @JoinColumn(name = "cart_id", referencedColumnName = "id")
    Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id", referencedColumnName = "id")
    Product product;

    @Column(name = "created_at")
    @CreationTimestamp
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    @CreationTimestamp
    LocalDateTime updatedAt;
}
