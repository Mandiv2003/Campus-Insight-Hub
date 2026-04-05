package com.smartcampus.service;

import com.smartcampus.dto.resource.AvailabilityWindowDto;
import com.smartcampus.dto.resource.ResourceRequestDto;
import com.smartcampus.dto.resource.ResourceResponseDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ResourceMapper;
import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;
    private final MongoTemplate mongoTemplate;

    // ── List (public, dynamic filters) ───────────────────────────────────
    public Page<ResourceResponseDto> listResources(ResourceType type, String location,
                                                    Integer minCapacity, ResourceStatus status,
                                                    Pageable pageable) {
        // Never include archived resources in public listings
        Criteria criteria = Criteria.where("status").ne(ResourceStatus.ARCHIVED.name());

        if (type != null)
            criteria.and("type").is(type.name());
        if (location != null && !location.isBlank())
            criteria.and("location").regex(location, "i");
        if (minCapacity != null)
            criteria.and("capacity").gte(minCapacity);
        if (status != null)
            criteria.and("status").is(status.name());

        Query query = new Query(criteria).with(pageable);
        List<Resource> resources = mongoTemplate.find(query, Resource.class);
        long total = mongoTemplate.count(new Query(criteria), Resource.class);

        return PageableExecutionUtils.getPage(resources, pageable, () -> total)
                .map(resourceMapper::toDto);
    }

    // ── Get single resource ──────────────────────────────────────────────
    public ResourceResponseDto getById(String id) {
        return resourceMapper.toDto(findOrThrow(id));
    }

    // ── Create ───────────────────────────────────────────────────────────
    public ResourceResponseDto create(ResourceRequestDto dto, String createdById) {
        Resource resource = Resource.builder()
                .name(dto.name())
                .type(dto.type())
                .capacity(dto.capacity())
                .location(dto.location())
                .description(dto.description())
                .imageUrl(dto.imageUrl())
                .status(ResourceStatus.ACTIVE)
                .createdById(createdById)
                .build();

        if (dto.availabilityWindows() != null) {
            resource.setAvailabilityWindows(new ArrayList<>());
            dto.availabilityWindows().forEach(w ->
                    resource.getAvailabilityWindows().add(
                            AvailabilityWindow.builder()
                                    .dayOfWeek(w.dayOfWeek())
                                    .startTime(w.startTime())
                                    .endTime(w.endTime())
                                    .build()));
        }

        return resourceMapper.toDto(resourceRepository.save(resource));
    }

    // ── Full update (PUT) ─────────────────────────────────────────────────
    public ResourceResponseDto update(String id, ResourceRequestDto dto) {
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
                                    .dayOfWeek(w.dayOfWeek())
                                    .startTime(w.startTime())
                                    .endTime(w.endTime())
                                    .build()));
        }

        return resourceMapper.toDto(resourceRepository.save(resource));
    }

    // ── Status update (PATCH) ─────────────────────────────────────────────
    public ResourceResponseDto updateStatus(String id, ResourceStatus newStatus) {
        Resource resource = findOrThrow(id);
        resource.setStatus(newStatus);
        resource.setUpdatedAt(LocalDateTime.now());
        return resourceMapper.toDto(resourceRepository.save(resource));
    }

    // ── Soft delete → ARCHIVED ────────────────────────────────────────────
    public void delete(String id) {
        Resource resource = findOrThrow(id);
        resource.setStatus(ResourceStatus.ARCHIVED);
        resource.setUpdatedAt(LocalDateTime.now());
        resourceRepository.save(resource);
    }

    // ── Add availability window (embedded) ────────────────────────────────
    public AvailabilityWindowDto addAvailabilityWindow(String resourceId, AvailabilityWindowDto dto) {
        Resource resource = findOrThrow(resourceId);
        AvailabilityWindow window = AvailabilityWindow.builder()
                .id(UUID.randomUUID().toString())
                .dayOfWeek(dto.dayOfWeek())
                .startTime(dto.startTime())
                .endTime(dto.endTime())
                .build();
        resource.getAvailabilityWindows().add(window);
        resource.setUpdatedAt(LocalDateTime.now());
        resourceRepository.save(resource);
        return resourceMapper.toWindowDto(window);
    }

    // ── Delete availability window (embedded) ─────────────────────────────
    public void deleteAvailabilityWindow(String resourceId, String windowId) {
        Resource resource = findOrThrow(resourceId);
        boolean removed = resource.getAvailabilityWindows().removeIf(w -> windowId.equals(w.getId()));
        if (!removed) {
            throw new ResourceNotFoundException("Availability window not found: " + windowId);
        }
        resource.setUpdatedAt(LocalDateTime.now());
        resourceRepository.save(resource);
    }

    // ── Internal helper ───────────────────────────────────────────────────
    private Resource findOrThrow(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }
}
