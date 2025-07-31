package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken , Long> {
     Optional<PasswordResetToken> findByToken(String token);

    List<PasswordResetToken> findTop10ByExpiresAtBefore(LocalDateTime expiresAt);
}
