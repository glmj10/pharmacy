package com.pharmacy.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class FileMetadataResponse {
    private UUID id;
    private String storedFileName;
    private String fileUrl;
}
