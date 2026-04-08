package com.smartcampus.dto.booking;

import com.smartcampus.model.enums.BookingStatus;

import java.time.LocalDateTime;

public record BookingResponseDto(
        String id,
        String resourceId,
        String resourceName,
        String requestedById,
        String requestedByName,
        String reviewedById,
        String reviewedByName,
        String title,
        String purpose,
        Integer expectedAttendees,
        LocalDateTime startDatetime,
        LocalDateTime endDatetime,
        BookingStatus status,
        String rejectionReason,
        String cancellationNote,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
