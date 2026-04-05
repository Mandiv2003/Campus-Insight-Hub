package com.smartcampus.dto.booking;

// Used for reject (rejectionReason required) and cancel (cancellationNote optional)
public record BookingDecisionDto(
        String rejectionReason,
        String cancellationNote
) {}
