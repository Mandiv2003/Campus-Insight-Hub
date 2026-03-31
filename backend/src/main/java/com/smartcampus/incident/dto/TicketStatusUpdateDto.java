package com.smartcampus.incident.dto;

import com.smartcampus.incident.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TicketStatusUpdateDto(
    @NotNull TicketStatus status,
    String resolutionNotes,     // required when status = RESOLVED
    String rejectionReason      // required when status = REJECTED
) {}
