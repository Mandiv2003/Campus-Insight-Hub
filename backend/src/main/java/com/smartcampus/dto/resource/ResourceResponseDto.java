package com.smartcampus.dto.resource;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;

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
) {}
