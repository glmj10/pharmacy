package com.pharmacy.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy.backend.dto.response.ErrorResponse;
import com.pharmacy.backend.repository.InvalidatedTokenRepository;
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


@Component
@RequiredArgsConstructor
public class JWTBlackListFilter extends OncePerRequestFilter {

    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
                    handleUnauthorized(response);
                    return;
                }
            } catch (ParseException e) {
                handleUnauthorized(response);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void handleUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
                "",
                LocalDateTime.now()
        );

        objectMapper.findAndRegisterModules();
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + "; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
