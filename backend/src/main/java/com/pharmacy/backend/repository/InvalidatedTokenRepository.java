package com.pharmacy.backend.repository;


import com.pharmacy.backend.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, Long> {
    boolean existsById(String jti);

    List<InvalidatedToken> findAllByExpirationTimeBefore(Date now);
}
