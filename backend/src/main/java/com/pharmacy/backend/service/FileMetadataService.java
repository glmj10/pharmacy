package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.FileMetadataResponse;
import com.pharmacy.backend.enums.FileCategory;
import jakarta.annotation.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface FileMetadataService {
    ApiResponse<FileMetadataResponse> storeFile(MultipartFile file, String category);
    FileSystemResource downloadFile(String uuidStr);
    ApiResponse<Void> deleteFile(String uuidStr);
    FileSystemResource loadFile(String uuidStr);
}
