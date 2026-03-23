package com.smartcampus.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID>,
        JpaSpecificationExecutor<Resource> {
    // JpaSpecificationExecutor enables dynamic multi-field filtering
    // via ResourceSpecification — no custom @Query needed
}
