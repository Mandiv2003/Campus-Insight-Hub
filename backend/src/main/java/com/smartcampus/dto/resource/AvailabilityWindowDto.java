package com.smartcampus.dto.resource;

import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record AvailabilityWindowDto(
        String id,           // null on request, populated on response
        @NotNull DayOfWeek dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime
) {}
