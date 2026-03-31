package com.smartcampus.booking.dto;

// Used for reject (rejectionReason required) and cancel (cancellationNote optional)
public record BookingDecisionDto(
    String rejectionReason,
    String cancellationNote
) {}
