package com.pharmacy.backend.entity;


import com.pharmacy.backend.enums.CategoryTypeEnum;
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
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "categories")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;
    String thumbnail;
    String slug;
    Long priority;

    @Enumerated(EnumType.STRING)
    CategoryTypeEnum type;

    @OneToMany(mappedBy = "parent")
    List<Category> children;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    Category parent;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "categories")
    @JoinTable(name = "product_categories",
            joinColumns = @JoinColumn(name = "category_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    List<Product> products;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "category")
    List<Blog> blogs;

    @CreationTimestamp
    @Column(name = "created_at")
    String createdAt;

    @CreationTimestamp
    @Column(name = "updated_at")
    String updatedAt;
}
