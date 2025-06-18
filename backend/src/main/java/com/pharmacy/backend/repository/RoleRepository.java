package com.pharmacy.backend.repository;

import com.pharmacy.backend.entity.Role;
import com.pharmacy.backend.enums.RoleCodeEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;


@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByCode(RoleCodeEnum code);

    Optional<Set<Role>> findAllByCodeIn(Collection<RoleCodeEnum> codes);
}

