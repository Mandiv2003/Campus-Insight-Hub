package com.smartcampus.booking;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Field("resource_id")
    @Indexed
    private String resourceId;

    @Field("resource_name")
    private String resourceName;

    @Field("requested_by_id")
    @Indexed
    private String requestedById;

    @Field("requested_by_name")
    private String requestedByName;

    @Field("reviewed_by_id")
    private String reviewedById;

    @Field("reviewed_by_name")
    private String reviewedByName;

    private String title;

    private String purpose;

    @Field("expected_attendees")
    private Integer expectedAttendees;

    @Field("start_datetime")
    private LocalDateTime startDatetime;

    @Field("end_datetime")
    private LocalDateTime endDatetime;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Field("rejection_reason")
    private String rejectionReason;

    @Field("cancellation_note")
    private String cancellationNote;

    @Field("reviewed_at")
    private LocalDateTime reviewedAt;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
