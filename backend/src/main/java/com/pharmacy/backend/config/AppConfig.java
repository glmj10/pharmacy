package com.pharmacy.backend.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Configuration
@Data
public class AppConfig {

    public static String getFileDownloadUrl(String filename) {
        if (filename == null) return null;
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/files/download/")
                .path(filename)
                .toUriString();
    }
}
