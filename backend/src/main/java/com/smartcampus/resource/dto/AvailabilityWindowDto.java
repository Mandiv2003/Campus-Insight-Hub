package com.smartcampus.resource.dto;

import com.smartcampus.resource.AvailabilityWindow;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record AvailabilityWindowDto(
    UUID id,                      // null on request, populated on response
    @NotNull DayOfWeek dayOfWeek,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime
) {
    public static AvailabilityWindowDto from(AvailabilityWindow w) {
        return new AvailabilityWindowDto(
            w.getId(), w.getDayOfWeek(), w.getStartTime(), w.getEndTime()
        );
    }
}
