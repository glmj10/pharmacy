package com.pharmacy.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String thumbnail;
    String title;
    Long priceOld;
    Long priceNew;
    Long quantity;
    String manufacturer;
    String type;
    String noted;
    String indication;
    String slug;
    Long priority = 1L;
    Boolean active = true;
    Long numberOfLikes = 0L;
    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "registration_number")
    String registrationNumber;

    @Column(name = "active_ingredient")
    String activeIngredient;

    @Column(name = "dosage_form")
    String dosageForm;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<ProductImage> images;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<Wishlist> wishlists;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    Brand brand;

    @ToString.Exclude
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "product_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    List<Category> categories;

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @CreationTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

}
