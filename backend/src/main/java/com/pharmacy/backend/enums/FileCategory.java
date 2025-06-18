package com.pharmacy.backend.enums;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FileCategory {
    AVATAR("avatar"),
    BLOG("blog"),
    PRODUCT("product");

    private final String subDirectory;

}
