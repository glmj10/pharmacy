package com.pharmacy.backend.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class AppConfig {

    private static String baseUrl;

    @Value("${app.base-url}")
    public void setBaseUrl(String url) {
        AppConfig.baseUrl = url;
    }

    public static String getFileDownloadUrl(String filename) {
        if (filename == null) return null;
        return baseUrl + "/api/v1/files/download/" + filename;
    }
}
