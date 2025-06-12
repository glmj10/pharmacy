package com.pharmacy.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.util.List;

@Entity
@Data
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
    Long price;
    Long quantity;
    String manufacturer;
    String type;
    String noted;
    String indication;
    String slug;
    Long priority;
    Boolean active;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "registration_number")
    String registrationNumber;

    @Column(name = "active_ingredient")
    String activeIngredient;

    @Column(name = "dosage_form")
    String dosageForm;

    @OneToMany(mappedBy = "product")
    List<ProductImage> images;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    Brand brand;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "product_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    List<Category> categories;

    @CreationTimestamp
    @Column(name = "created_at")
    String createdAt;

    @CreationTimestamp
    @Column(name = "updated_at")
    String updatedAt;

}
