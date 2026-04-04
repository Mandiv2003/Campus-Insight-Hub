package com.smartcampus.resource;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

// Embedded subdocument — NOT a standalone @Document collection.
// Stored inside the Resource document's availabilityWindows array.
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
