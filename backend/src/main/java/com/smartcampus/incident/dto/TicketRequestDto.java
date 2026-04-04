package com.smartcampus.incident.dto;

import com.smartcampus.incident.TicketCategory;
import com.smartcampus.incident.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketRequestDto(
    String resourceId,                    // nullable — ticket may not be linked to a resource
    @NotBlank String title,
    @NotBlank String description,
    @NotNull TicketCategory category,
    @NotNull TicketPriority priority,
    String locationDetail,
    String contactPhone,
    String contactEmail
) {}
