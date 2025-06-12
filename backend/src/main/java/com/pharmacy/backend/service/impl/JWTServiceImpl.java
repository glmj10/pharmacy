package com.pharmacy.backend.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy.backend.enums.RoleCodeEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.repository.InvalidatedTokenRepository;
import com.pharmacy.backend.service.JWTService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class JWTServiceImpl implements JWTService {
    @Value("${jwt.secret}")
    String secret;

    @Value("${jwt.expiration}")
    long expiration;

    static final String ISUER = "Pharmacy-Backend";
    final InvalidatedTokenRepository invalidatedTokenRepository;

    @Override
    public String generateToken(Long userId, String username, List<RoleCodeEnum> roles) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        // Chỉ sử dụng tên của role, không thêm tiền tố "ROLE_"
        List<String> authorities = roles.stream()
                .map(Enum::name).toList();

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer(ISUER)
                .subject(username)
                .claim("authorities", authorities)
                .claim("id", userId)
                .issueTime(new Date())
                .jwtID(UUID.randomUUID().toString())
                .expirationTime(new Date(System.currentTimeMillis() + expiration * 1000))
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
        } catch (JOSEException e) {
            throw new RuntimeException("Error signing JWT token", e);
        }
        return jwsObject.serialize();
    }

    @Override
    public String getUserNameFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();

            return claimsSet.getStringClaim("username");
        } catch (ParseException e) {
            throw new RuntimeException("Error parsing JWT token", e);
        }
    }

    @Override
    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secret.getBytes());

            verifyToken(token);
            return signedJWT.verify(verifier) &&
                    signedJWT.getJWTClaimsSet()
                            .getExpirationTime()
                            .after(new java.util.Date());

        } catch (ParseException | JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(token);

        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);
        if(!verified) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ", "token");
        }

        if(expirationTime == null || expirationTime.before(new Date())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn", "token");
        }
    }
}
