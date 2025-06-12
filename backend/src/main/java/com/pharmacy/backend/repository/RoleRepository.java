package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Role;
import com.pharmacy.backend.enums.RoleCodeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByCode(RoleCodeEnum code);
}

