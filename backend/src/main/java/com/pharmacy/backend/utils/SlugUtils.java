package com.pharmacy.backend.utils;

public class SlugUtils {
    public static String generateSlug(String title) {
        if (title == null || title.isEmpty()) {
            return null;
        }

        return title.trim().toLowerCase()
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }
}
