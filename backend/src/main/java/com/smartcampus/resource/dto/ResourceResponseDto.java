package com.smartcampus.resource.dto;

import com.smartcampus.resource.Resource;
import com.smartcampus.resource.ResourceStatus;
import com.smartcampus.resource.ResourceType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ResourceResponseDto(
    UUID id,
    String name,
    ResourceType type,
    Integer capacity,
    String location,
    String description,
    ResourceStatus status,
    String imageUrl,
    UUID createdById,
    List<AvailabilityWindowDto> availabilityWindows,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ResourceResponseDto from(Resource r) {
        return new ResourceResponseDto(
            r.getId(),
            r.getName(),
            r.getType(),
            r.getCapacity(),
            r.getLocation(),
            r.getDescription(),
            r.getStatus(),
            r.getImageUrl(),
            r.getCreatedBy().getId(),
            r.getAvailabilityWindows().stream()
                .map(AvailabilityWindowDto::from)
                .toList(),
            r.getCreatedAt(),
            r.getUpdatedAt()
        );
    }
}
