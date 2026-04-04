package com.smartcampus.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByProviderId(String providerId);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByRoleAndActive(Role role, boolean active, Pageable pageable);

    List<User> findByRoleAndActiveTrue(Role role);
}
