package com.smartcampus.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Embedded subdocument — stored inside the Resource document's
 * {@code availabilityWindows} array. Not a standalone collection.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AvailabilityWindow {

    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Field("day_of_week")
    private DayOfWeek dayOfWeek;

    @Field("start_time")
    private LocalTime startTime;

    @Field("end_time")
    private LocalTime endTime;
}
