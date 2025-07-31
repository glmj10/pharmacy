package com.pharmacy.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "file_meta_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileMetadata {
    @Id
    @Column(name = "uuid", nullable = false, unique = true)
    @Builder.Default
    UUID uuid = UUID.randomUUID();

    @Column(name = "original_file_name", nullable = false)
    String originalFileName;

    @Column(name = "stored_file_name", nullable = false)
    String storedFileName;

    String url;

    @Column(name = "file_extension", nullable = false)
    String fileExtension;

    @Column(name = "file_size", nullable = false)
    long fileSize;

    @Column(name = "content_type", nullable = false)
    String contentType;

    @Column(name = "file_type", nullable = false)
    String fileType;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;

}
