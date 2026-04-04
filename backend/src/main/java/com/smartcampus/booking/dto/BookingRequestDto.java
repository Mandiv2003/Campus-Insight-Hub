package com.smartcampus.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record BookingRequestDto(
    @NotNull String resourceId,
    @NotBlank String title,
    @NotBlank String purpose,
    @NotNull @Future LocalDateTime startDatetime,
    @NotNull @Future LocalDateTime endDatetime,
    @Min(1) Integer expectedAttendees           // nullable
) {}
