package com.pharmacy.backend.service;

import com.nimbusds.jose.JOSEException;
import com.pharmacy.backend.enums.RoleCodeEnum;

import java.text.ParseException;
import java.util.List;

public interface JWTService {
    String generateToken(Long userId, String username, List<RoleCodeEnum> role);
    String getUserNameFromToken(String token);
    boolean validateToken(String token);
    void verifyToken(String token) throws JOSEException, ParseException;
}
