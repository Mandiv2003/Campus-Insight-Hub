package com.smartcampus.booking.dto;

import com.smartcampus.booking.Booking;

import java.time.LocalDateTime;

// Public endpoint only exposes time ranges, not booking details
public record TimeSlotDto(LocalDateTime startDatetime, LocalDateTime endDatetime) {
    public static TimeSlotDto from(Booking b) {
        return new TimeSlotDto(b.getStartDatetime(), b.getEndDatetime());
    }
}
