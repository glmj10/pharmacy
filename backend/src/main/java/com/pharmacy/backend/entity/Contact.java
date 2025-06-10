package com.pharmacy.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "contact")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String address;

    @Column(columnDefinition = "TEXT")
    String content;

    String email;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "phone_number")
    String phoneNumber;

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @CreationTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
