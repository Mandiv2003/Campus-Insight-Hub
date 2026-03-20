package com.smartcampus.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByProviderId(String providerId);

    Optional<User> findByEmail(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByRoleAndActive(Role role, boolean active, Pageable pageable);

    Page<User> findAll(Pageable pageable);

    List<User> findByRoleAndActiveTrue(Role role);
}
