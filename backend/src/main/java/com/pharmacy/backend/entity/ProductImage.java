package com.pharmacy.backend.entity;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product_images")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String url;

    @ManyToOne
    @JoinColumn(name = "product_id")
    Product product;

    @CreationTimestamp
    @Column(name = "created_at")
    String createdAt;

    @CreationTimestamp
    @Column(name = "updated_at")
    String updatedAt;
}
