package com.smartcampus.resource.dto;

import com.smartcampus.resource.Resource;
import com.smartcampus.resource.ResourceStatus;
import com.smartcampus.resource.ResourceType;

import java.time.LocalDateTime;
import java.util.List;

public record ResourceResponseDto(
    String id,
    String name,
    ResourceType type,
    Integer capacity,
    String location,
    String description,
    ResourceStatus status,
    String imageUrl,
    String createdById,
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
            r.getCreatedById(),
            r.getAvailabilityWindows().stream()
                .map(AvailabilityWindowDto::from)
                .toList(),
            r.getCreatedAt(),
            r.getUpdatedAt()
        );
    }
}
