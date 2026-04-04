package com.smartcampus.booking.dto;

import com.smartcampus.booking.Booking;
import com.smartcampus.booking.BookingStatus;

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
) {
    public static BookingResponseDto from(Booking b) {
        return new BookingResponseDto(
            b.getId(),
            b.getResourceId(),
            b.getResourceName(),
            b.getRequestedById(),
            b.getRequestedByName(),
            b.getReviewedById(),
            b.getReviewedByName(),
            b.getTitle(),
            b.getPurpose(),
            b.getExpectedAttendees(),
            b.getStartDatetime(),
            b.getEndDatetime(),
            b.getStatus(),
            b.getRejectionReason(),
            b.getCancellationNote(),
            b.getReviewedAt(),
            b.getCreatedAt(),
            b.getUpdatedAt()
        );
    }
}
