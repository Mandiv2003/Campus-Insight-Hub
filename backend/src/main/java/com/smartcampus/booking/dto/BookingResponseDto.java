package com.smartcampus.booking.dto;

import com.smartcampus.booking.Booking;
import com.smartcampus.booking.BookingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponseDto(
    UUID id,
    UUID resourceId,
    String resourceName,
    UUID requestedById,
    String requestedByName,
    UUID reviewedById,
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
            b.getResource().getId(),
            b.getResource().getName(),
            b.getRequestedBy().getId(),
            b.getRequestedBy().getFullName(),
            b.getReviewedBy() != null ? b.getReviewedBy().getId() : null,
            b.getReviewedBy() != null ? b.getReviewedBy().getFullName() : null,
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
