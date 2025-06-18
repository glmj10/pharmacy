package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.config.FileStorageProperties;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.FileMetadataResponse;
import com.pharmacy.backend.entity.FileMetadata;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.enums.FileCategory;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.repository.FileMetadataRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.FileMetadataService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class FileMetadataServiceImpl implements FileMetadataService {
    private final FileMetadataRepository fileMetadataRepository;
    private final FileStorageProperties properties;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public ApiResponse<FileMetadataResponse> storeFile(MultipartFile file, String category) {
        FileCategory fileCategory = FileCategory.valueOf(category.toUpperCase());
        String originalFileName = file.getOriginalFilename();
        String extension = Optional.ofNullable(originalFileName)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(originalFileName.lastIndexOf('.') + 1))
                .orElse("Unknown");

        String storedName = UUID.randomUUID() + "_" + originalFileName;
        Path baseDir = Paths.get(properties.getUploadDir()).toAbsolutePath().normalize();
        Path targetDir = baseDir.resolve(fileCategory.getSubDirectory());

        try {
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalFileName, e);
        }

        Long userId = SecurityUtils.getCurrentUserId();
        assert userId != null;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", "User not found"));

        FileMetadata fileMetadata = FileMetadata.builder()
                .originalFileName(originalFileName)
                .storedFileName(storedName)
                .fileExtension(extension)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .fileType(fileCategory.getSubDirectory())
                .user(user)
                .build();
        fileMetadata = fileMetadataRepository.save(fileMetadata);

        FileMetadataResponse response = FileMetadataResponse.builder()
                .id(fileMetadata.getUuid())
                .storedFileName(fileMetadata.getStoredFileName())
                .build();

        return ApiResponse.<FileMetadataResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Upload file thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public FileSystemResource downloadFile(String uuidStr) {
        FileMetadata metadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp tin", "File not found"));

        Path filePath = Paths.get(properties.getUploadDir() + "/" + metadata.getFileType())
                .resolve(metadata.getStoredFileName())
                .normalize();

        if(!Files.exists(filePath)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Tệp tin không tồn tại", "File does not exist");
        }

        FileSystemResource resource = new FileSystemResource(filePath);
        if (!resource.exists() || !resource.isReadable()) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể đọc tệp tin", "File cannot be read");
        }

        return resource;
    }

    @Transactional
    @Override
    public ApiResponse<Void> deleteFile(String uuidStr) {
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp tin", "File not found"));

        Path filePath = Paths.get(properties.getUploadDir())
                .resolve(fileMetadata.getStoredFileName())
                .normalize();
        try {
            Files.deleteIfExists(filePath);
            fileMetadataRepository.delete(fileMetadata);
            return ApiResponse.<Void>builder()
                    .status(HttpStatus.OK.value())
                    .message("Xóa tệp tin thành công")
                    .timestamp(LocalDateTime.now())
                    .build();
        } catch (IOException e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xóa tệp tin", "Failed to delete file");
        }
    }

    @Override
    public FileSystemResource loadFile(String uuidStr) {
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp tin", "File not found"));

        Path filePath = Paths.get(properties.getUploadDir() + "/" + fileMetadata.getFileType())
                .resolve(fileMetadata.getStoredFileName())
                .normalize();

        if (!Files.exists(filePath)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Tệp tin không tồn tại", "File does not exist");
        }

        FileSystemResource resource = new FileSystemResource(filePath);

        if (!resource.exists() || !resource.isReadable()) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể đọc tệp tin", "File cannot be read");
        }

        return resource;
    }
}
