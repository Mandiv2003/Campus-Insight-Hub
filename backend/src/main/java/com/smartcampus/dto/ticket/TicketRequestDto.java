package com.smartcampus.dto.ticket;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketRequestDto(
        String resourceId,              // nullable — ticket may not link to a specific resource
        @NotBlank String title,
        @NotBlank String description,
        @NotNull TicketCategory category,
        @NotNull TicketPriority priority,
        String locationDetail,
        String contactPhone,
        String contactEmail
) {}
