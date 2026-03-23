package com.smartcampus.resource;

import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.resource.dto.*;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final AvailabilityWindowRepository availabilityWindowRepository;
    private final UserRepository userRepository;

    // ── List (public, filters applied via Specification) ──────────────────
    @Transactional(readOnly = true)
    public Page<ResourceResponseDto> listResources(
            ResourceType type, String location, Integer minCapacity,
            ResourceStatus status, Pageable pageable) {

        return resourceRepository
            .findAll(ResourceSpecification.withFilters(type, location, minCapacity, status), pageable)
            .map(ResourceResponseDto::from);
    }

    // ── Get single resource ────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public ResourceResponseDto getById(UUID id) {
        return ResourceResponseDto.from(findOrThrow(id));
    }

    // ── Create ─────────────────────────────────────────────────────────────
    @Transactional
    public ResourceResponseDto create(ResourceRequestDto dto, UUID createdById) {
        User creator = userRepository.findById(createdById)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + createdById));

        Resource resource = Resource.builder()
            .name(dto.name())
            .type(dto.type())
            .capacity(dto.capacity())
            .location(dto.location())
            .description(dto.description())
            .imageUrl(dto.imageUrl())
            .status(ResourceStatus.ACTIVE)
            .createdBy(creator)
            .build();

        if (dto.availabilityWindows() != null) {
            resource.setAvailabilityWindows(new ArrayList<>());
            dto.availabilityWindows().forEach(w ->
                resource.getAvailabilityWindows().add(
                    AvailabilityWindow.builder()
                        .resource(resource)
                        .dayOfWeek(w.dayOfWeek())
                        .startTime(w.startTime())
                        .endTime(w.endTime())
                        .build()
                )
            );
        }

        return ResourceResponseDto.from(resourceRepository.save(resource));
    }

    // ── Full update (PUT) — replaces all fields and windows ───────────────
    @Transactional
    public ResourceResponseDto update(UUID id, ResourceRequestDto dto) {
        Resource resource = findOrThrow(id);

        resource.setName(dto.name());
        resource.setType(dto.type());
        resource.setCapacity(dto.capacity());
        resource.setLocation(dto.location());
        resource.setDescription(dto.description());
        resource.setImageUrl(dto.imageUrl());
        resource.setUpdatedAt(LocalDateTime.now());

        if (dto.availabilityWindows() != null) {
            resource.getAvailabilityWindows().clear();
            dto.availabilityWindows().forEach(w ->
                resource.getAvailabilityWindows().add(
                    AvailabilityWindow.builder()
                        .resource(resource)
                        .dayOfWeek(w.dayOfWeek())
                        .startTime(w.startTime())
                        .endTime(w.endTime())
                        .build()
                )
            );
        }

        return ResourceResponseDto.from(resourceRepository.save(resource));
    }

    // ── Status update (PATCH) ──────────────────────────────────────────────
    @Transactional
    public ResourceResponseDto updateStatus(UUID id, ResourceStatus newStatus) {
        Resource resource = findOrThrow(id);
        resource.setStatus(newStatus);
        resource.setUpdatedAt(LocalDateTime.now());
        return ResourceResponseDto.from(resourceRepository.save(resource));
    }

    // ── Soft delete — sets status to ARCHIVED ─────────────────────────────
    @Transactional
    public void delete(UUID id) {
        Resource resource = findOrThrow(id);

        // TODO: After M2 completes their Booking entity, inject BookingRepository
        // and uncomment this conflict check:
        //
        // boolean hasActive = bookingRepository.existsByResourceIdAndStatusIn(
        //     id, List.of(BookingStatus.PENDING, BookingStatus.APPROVED));
        // if (hasActive)
        //     throw new ConflictException("Cannot archive resource with active or pending bookings");

        resource.setStatus(ResourceStatus.ARCHIVED);
        resource.setUpdatedAt(LocalDateTime.now());
        resourceRepository.save(resource);
    }

    // ── Availability windows ───────────────────────────────────────────────
    @Transactional
    public AvailabilityWindowDto addAvailabilityWindow(UUID resourceId, AvailabilityWindowDto dto) {
        Resource resource = findOrThrow(resourceId);
        AvailabilityWindow window = AvailabilityWindow.builder()
            .resource(resource)
            .dayOfWeek(dto.dayOfWeek())
            .startTime(dto.startTime())
            .endTime(dto.endTime())
            .build();
        return AvailabilityWindowDto.from(availabilityWindowRepository.save(window));
    }

    @Transactional
    public void deleteAvailabilityWindow(UUID resourceId, UUID windowId) {
        AvailabilityWindow window = availabilityWindowRepository
            .findByIdAndResourceId(windowId, resourceId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Availability window not found: " + windowId));
        availabilityWindowRepository.delete(window);
    }

    // ── Internal helper ────────────────────────────────────────────────────
    private Resource findOrThrow(UUID id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }
}
