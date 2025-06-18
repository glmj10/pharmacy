package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.FileMetadataResponse;
import com.pharmacy.backend.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/files")
public class FileController {
    private final FileMetadataService fileMetadataService;

    @PostMapping("/upload/{category}")
    public ResponseEntity<ApiResponse<FileMetadataResponse>> uploadFile(@PathVariable String category,
                                                                        @RequestPart("file") MultipartFile file) {
        ApiResponse<FileMetadataResponse> response = fileMetadataService.storeFile(file, category);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/download/{uuid}")
    public ResponseEntity<FileSystemResource> downloadFile(@PathVariable String uuid) {
        FileSystemResource resource = fileMetadataService.downloadFile(uuid);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/jpeg"))
                .body(resource);
    }

    @DeleteMapping("/delete/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String uuid) {
        ApiResponse<Void> response = fileMetadataService.deleteFile(uuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/load/{uuid}")
    public ResponseEntity<FileSystemResource> loadFile(@PathVariable String uuid) {
        FileSystemResource resource = fileMetadataService.loadFile(uuid);
        return ResponseEntity.ok().
                contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
