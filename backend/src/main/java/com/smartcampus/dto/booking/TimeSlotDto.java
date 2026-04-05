package com.smartcampus.dto.booking;

import java.time.LocalDateTime;

// Public availability endpoint — exposes time ranges only, no booking details
public record TimeSlotDto(
        LocalDateTime startDatetime,
        LocalDateTime endDatetime
) {}
