package com.pharmacy.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy.backend.dto.response.ErrorResponse;
import com.pharmacy.backend.entity.InvalidatedToken;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.repository.InvalidatedTokenRepository;
import com.pharmacy.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Objects;


@Component
@RequiredArgsConstructor
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                SignedJWT signedJWT = SignedJWT.parse(token);
                String jti = signedJWT.getJWTClaimsSet().getJWTID();
                if (jti != null && invalidatedTokenRepository.existsById(jti)) {
                    handleUnauthorized(response, "Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi");
                    return;
                }

                if(signedJWT.getJWTClaimsSet().getExpirationTime().before(new java.util.Date()) ) {
                    handleUnauthorized(response, "Phiên đăng nhập đã hết hạn");
                    return;
                }

                User user = userRepository.findById((Long) signedJWT.getJWTClaimsSet().getClaim("id"))
                        .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "userId"));

                Integer tokenVersion = Integer.parseInt(signedJWT.getJWTClaimsSet().getClaim("ver").toString());
                if(!tokenVersion.equals(user.getTokenVersion())) {
                    invalidatedTokenRepository.save(new InvalidatedToken(jti, signedJWT.getJWTClaimsSet().getExpirationTime()));
                    handleUnauthorized(response, "Phiên đăng nhập đã được câp nhật. Vui lòng đăng nhập lại.");
                    return;
                }
            } catch (ParseException e) {
                handleUnauthorized(response, e.getMessage());
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void handleUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();

        objectMapper.findAndRegisterModules();
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + "; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
