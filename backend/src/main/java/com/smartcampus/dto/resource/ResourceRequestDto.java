package com.smartcampus.dto.resource;

import com.smartcampus.model.enums.ResourceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ResourceRequestDto(
        @NotBlank String name,
        @NotNull ResourceType type,
        @Min(1) Integer capacity,           // nullable for EQUIPMENT
        @NotBlank String location,
        String description,
        String imageUrl,
        @Valid List<AvailabilityWindowDto> availabilityWindows
) {}
