package com.smartcampus.resource;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AvailabilityWindowRepository extends JpaRepository<AvailabilityWindow, UUID> {

    List<AvailabilityWindow> findByResourceId(UUID resourceId);

    Optional<AvailabilityWindow> findByIdAndResourceId(UUID id, UUID resourceId);
}
