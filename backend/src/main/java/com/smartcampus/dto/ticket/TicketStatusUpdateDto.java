package com.smartcampus.dto.ticket;

import com.smartcampus.model.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TicketStatusUpdateDto(
        @NotNull TicketStatus status,
        String resolutionNotes,     // required when status = RESOLVED
        String rejectionReason      // required when status = REJECTED
) {}
